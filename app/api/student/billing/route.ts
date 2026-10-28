import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_MONTHLY_MESS_FEE = 4500; // ₹150/day × 30 days

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId query parameter' },
                { status: 400 }
            );
        }

        // 1. Fetch student profile
        const { data: student, error: userError } = await supabase
            .from('users')
            .select('id, reg_no, full_name, dietary_preference, rebate_balance')
            .eq('id', userId)
            .single();

        if (userError || !student) {
            return NextResponse.json(
                { success: false, error: 'Student not found' },
                { status: 404 }
            );
        }

        // 2. Fetch itemized rebate ledger joined with meal_sessions details
        const { data: ledgerEntries, error: ledgerError } = await supabase
            .from('rebate_ledger')
            .select(`
                id,
                credit_amount,
                created_at,
                meal:meal_id ( service_date, type, base_cost )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (ledgerError) throw ledgerError;

        // 3. Compute total rebate from ledger rows (Double-Entry Verification)
        const totalRebate = (ledgerEntries || []).reduce(
            (sum, item) => sum + Number(item.credit_amount),
            0
        );

        const netPayable = Math.max(0, BASE_MONTHLY_MESS_FEE - totalRebate);

        return NextResponse.json({
            success: true,
            student,
            billingSummary: {
                baseMonthlyFee: BASE_MONTHLY_MESS_FEE,
                mealsSkippedCount: (ledgerEntries || []).length,
                totalRebateCredited: totalRebate,
                netPayableAmount: netPayable
            },
            rebateHistory: ledgerEntries || []
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}