import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyQrToken } from '@/lib/qr';

export async function POST(request: Request) {
    const startTime = Date.now();

    try {
        // 1. Read qrString and optional scannerId sent by the staff scanner
        const body = await request.json();
        const { qrString, scannerId } = body;

        if (!qrString) {
            return NextResponse.json(
                { success: false, error: 'Missing qrString in request body' },
                { status: 400 }
            );
        }

        // 2. Cryptographic HMAC-SHA256 & 30s Window Verification
        const verification = verifyQrToken(qrString);

        if (!verification.valid) {
            return NextResponse.json(
                { success: false, error: verification.error },
                { status: 401 }
            );
        }

        const { userId, mealId } = verification;

        // 3. ATOMIC COMPARE-AND-SWAP (CAS) DATABASE UPDATE
        // Only updates if status is currently 'OPT_IN'. PostgreSQL locks the row automatically!
        const { data: redeemedRows, error: updateError } = await supabase
            .from('meal_bookings')
            .update({
                status: 'CONSUMED',
                scanned_at: new Date().toISOString(),
                scanner_id: scannerId || null
            })
            .eq('user_id', userId)
            .eq('meal_id', mealId)
            .eq('status', 'OPT_IN')
            .select('id, scanned_at');

        if (updateError) {
            throw updateError;
        }

        // 4. If 0 rows were updated, the token was ALREADY scanned or student opted out!
        if (!redeemedRows || redeemedRows.length === 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'DOUBLE-SCAN BLOCKED: Meal token already consumed or student opted out!' 
                },
                { status: 409 }
            );
        }

        // 5. Fetch student details (Name, Reg No, Dietary Preference) to display on staff screen
        const { data: student } = await supabase
            .from('users')
            .select('full_name, reg_no, dietary_preference')
            .eq('id', userId)
            .single();

        const latencyMs = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            message: 'Meal verified! Allow student to enter.',
            student: student || { userId },
            scannedAt: redeemedRows[0].scanned_at,
            latencyMs
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}