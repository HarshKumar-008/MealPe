import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // 1. Read userId and mealId sent by the frontend
        const body = await request.json();
        const { userId, mealId } = body;

        if (!userId || !mealId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId or mealId' },
                { status: 400 }
            );
        }

        // 2. Fetch the meal's cutoff_time and base_cost from the database
        const { data: meal, error: mealError } = await supabase
            .from('meal_sessions')
            .select('id, type, cutoff_time, base_cost, state')
            .eq('id', mealId)
            .single();

        if (mealError || !meal) {
            return NextResponse.json(
                { success: false, error: 'Meal session not found' },
                { status: 404 }
            );
        }

        // 3. SERVER-CLOCK CUTOFF CHECK (Tamper-Proof Defense)
        const serverNow = new Date();
        const cutoffTime = new Date(meal.cutoff_time);

        if (serverNow >= cutoffTime || meal.state !== 'OPEN') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Cutoff deadline has passed. Meal preparation has already started!' 
                },
                { status: 403 }
            );
        }

        // 4. ATOMIC UPDATE: Change status from OPT_IN -> OPT_OUT
        // Using .eq('status', 'OPT_IN') ensures a student cannot opt-out twice for double rebate!
        const { data: updatedBooking, error: updateError } = await supabase
            .from('meal_bookings')
            .update({ status: 'OPT_OUT' })
            .eq('user_id', userId)
            .eq('meal_id', mealId)
            .eq('status', 'OPT_IN')
            .select();

        if (updateError) {
            throw updateError;
        }

        // If updatedBooking is empty, they already opted out or already ate the meal
        if (!updatedBooking || updatedBooking.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Meal is already opted out or already consumed' },
                { status: 409 }
            );
        }

        // 5. Insert rebate credit into rebate_ledger
        const creditAmount = Number(meal.base_cost);
        const { error: ledgerError } = await supabase
            .from('rebate_ledger')
            .insert({
                user_id: userId,
                meal_id: mealId,
                credit_amount: creditAmount
            });

        if (ledgerError) {
            throw ledgerError;
        }

        // 6. Update student's total rebate_balance in the users table
        const { data: userData } = await supabase
            .from('users')
            .select('rebate_balance')
            .eq('id', userId)
            .single();

        const newBalance = Number(userData?.rebate_balance || 0) + creditAmount;

        await supabase
            .from('users')
            .update({ rebate_balance: newBalance })
            .eq('id', userId);

        // 7. Return success response with rebate details
        return NextResponse.json({
            success: true,
            message: 'Successfully opted out of meal and credited rebate',
            creditedAmount: creditAmount,
            newRebateBalance: newBalance
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}