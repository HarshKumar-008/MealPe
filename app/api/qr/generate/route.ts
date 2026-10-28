import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateQrToken } from '@/lib/qr';

export async function GET(request: Request) {
    try {
        // 1. Read userId and mealId from URL query parameters: ?userId=...&mealId=...
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const mealId = searchParams.get('mealId');

        if (!userId || !mealId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId or mealId query parameters' },
                { status: 400 }
            );
        }

        // 2. Verify in database that the student is actually OPT_IN for this meal
        const { data: booking, error } = await supabase
            .from('meal_bookings')
            .select('status')
            .eq('user_id', userId)
            .eq('meal_id', mealId)
            .single();

        if (error || !booking) {
            return NextResponse.json(
                { success: false, error: 'No booking found for this student and meal' },
                { status: 404 }
            );
        }

        if (booking.status === 'OPT_OUT') {
            return NextResponse.json(
                { success: false, error: 'You opted out of this meal and cannot generate a QR pass' },
                { status: 403 }
            );
        }

        if (booking.status === 'CONSUMED') {
            return NextResponse.json(
                { success: false, error: 'Meal already consumed! Token burned.' },
                { status: 409 }
            );
        }

        // 3. Generate the 30-second HMAC-SHA256 QR token
        const tokenData = generateQrToken(userId, mealId);

        return NextResponse.json({
            success: true,
            qrString: tokenData.qrString,
            timeSlot: tokenData.timeSlot,
            secondsRemaining: tokenData.secondsRemaining
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}