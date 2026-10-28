import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch all meals from Supabase, ordered by date and cutoff time
        const { data: meals, error } = await supabase
            .from('meal_sessions')
            .select('*')
            .order('service_date', { ascending: true })
            .order('cutoff_time', { ascending: true });

        // If Supabase throws an error (e.g., table doesn't exist), catch it
        if (error) {
            throw error;
        }

        // Send the meals back to the frontend as a successful JSON response
        return NextResponse.json({ success: true, meals });

    } catch (error: any) {
        // If anything fails, send a 500 Internal Server Error
        return NextResponse.json(
            { success: false, error: error.message }, 
            { status: 500 }
        );
    }
}