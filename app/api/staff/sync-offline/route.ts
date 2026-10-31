import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSignature } from '@/lib/qr';

// 1. GET: Pre-fetch today's opted-in roster so the scanner PWA can work offline
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mealId = searchParams.get('mealId');

        if (!mealId) {
            return NextResponse.json(
                { success: false, error: 'Missing mealId query parameter' },
                { status: 400 }
            );
        }

        const { data: roster, error } = await supabase
            .from('meal_bookings')
            .select(`
                user_id,
                meal_id,
                status,
                users:user_id ( full_name, reg_no, dietary_preference )
            `)
            .eq('meal_id', mealId)
            .eq('status', 'OPT_IN');

        if (error) throw error;

        return NextResponse.json({
            success: true,
            mealId,
            optedInCount: (roster || []).length,
            roster: roster || []
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// 2. POST: Batch-sync queued offline scans when internet returns
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offlineScans, scannerId } = body;

        if (!Array.isArray(offlineScans) || offlineScans.length === 0) {
            return NextResponse.json(
                { success: false, error: 'offlineScans array is required' },
                { status: 400 }
            );
        }

        const results = [];

        for (const item of offlineScans) {
            const { qrString, scannedAt } = item;
            const parts = (qrString || '').split('|');

            if (parts.length !== 4) {
                results.push({ qrString, status: 'REJECTED', reason: 'Malformed QR' });
                continue;
            }

            const [userId, mealId, slotStr, signature] = parts;
            const tokenSlot = parseInt(slotStr, 10);

            // Verify HMAC signature
            const expectedSig = createSignature(userId, mealId, tokenSlot);
            if (signature !== expectedSig) {
                results.push({ userId, mealId, status: 'REJECTED', reason: 'Invalid HMAC signature' });
                continue;
            }

            // Verify the token was fresh AT THE MOMENT it was scanned offline
            const scanTimeMs = scannedAt ? new Date(scannedAt).getTime() : Date.now();
            const slotAtScanTime = Math.floor(scanTimeMs / 30000);

            if (Math.abs(slotAtScanTime - tokenSlot) > 2) {
                results.push({ userId, mealId, status: 'REJECTED', reason: 'Token was expired at scan time' });
                continue;
            }

            // Atomic update in PostgreSQL (Idempotent: safe even if synced twice)
            const { data: updated } = await supabase
                .from('meal_bookings')
                .update({
                    status: 'CONSUMED',
                    scanned_at: scannedAt || new Date().toISOString(),
                    scanner_id: scannerId || null
                })
                .eq('user_id', userId)
                .eq('meal_id', mealId)
                .eq('status', 'OPT_IN')
                .select('id');

            if (updated && updated.length > 0) {
                results.push({ userId, mealId, status: 'SYNCED' });
            } else {
                results.push({ userId, mealId, status: 'ALREADY_CONSUMED_OR_SKIPPED' });
            }
        }

        return NextResponse.json({
            success: true,
            totalProcessed: offlineScans.length,
            results
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}