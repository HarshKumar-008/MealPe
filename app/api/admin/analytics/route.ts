import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Fetch all meal sessions ordered by date
        const { data: meals, error: mealsError } = await supabase
            .from('meal_sessions')
            .select('*')
            .order('service_date', { ascending: true });

        if (mealsError) throw mealsError;

        // 2. Fetch all bookings along with each student's dietary_preference
        const { data: bookings, error: bookingsError } = await supabase
            .from('meal_bookings')
            .select(`
                id,
                meal_id,
                status,
                users:user_id ( dietary_preference )
            `);

        if (bookingsError) throw bookingsError;

        // 3. Aggregate stats for each meal session
        const analytics = (meals || []).map((meal) => {
            const mealBookings = (bookings || []).filter((b) => b.meal_id === meal.id);

            // Students who didn't opt out (OPT_IN + CONSUMED = Projected Kitchen Prep)
            const projectedList = mealBookings.filter((b) => b.status !== 'OPT_OUT');
            const consumedList = mealBookings.filter((b) => b.status === 'CONSUMED');
            const optedOutList = mealBookings.filter((b) => b.status === 'OPT_OUT');

            // Count dietary breakdown among projected plates
            const dietaryBreakdown = { VEG: 0, JAIN: 0, EGG: 0 };
            projectedList.forEach((b: any) => {
                const pref = b.users?.dietary_preference || 'VEG';
                if (pref in dietaryBreakdown) {
                    dietaryBreakdown[pref as keyof typeof dietaryBreakdown]++;
                }
            });

            const projectedCount = projectedList.length;
            const consumedCount = consumedList.length;
            const unconsumedPlates = Math.max(0, projectedCount - consumedCount);

            // Trigger surplus alert if meal is ACTIVE/CLOSED and unconsumed plates >= 3 (demo threshold)
            const surplusAlert = 
                (meal.state === 'ACTIVE' || meal.state === 'CLOSED') && 
                unconsumedPlates >= 3;

            return {
                mealId: meal.id,
                serviceDate: meal.service_date,
                mealType: meal.type,
                state: meal.state,
                projectedCount,
                consumedCount,
                optedOutCount: optedOutList.length,
                unconsumedPlates,
                surplusAlert,
                dietaryBreakdown
            };
        });

        return NextResponse.json({
            success: true,
            analytics
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}