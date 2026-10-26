import { createClient } from '@supabase/supabase-js';

// Read the URL and Key from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export a single Supabase connection that all API routes can use
export const supabase = createClient(supabaseUrl, supabaseKey);