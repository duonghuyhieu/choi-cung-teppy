import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file or Vercel environment variables. ' +
    'See README.md for setup instructions.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env.local file or Vercel environment variables. ' +
    'See README.md for setup instructions.'
  );
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Server-side Supabase client (uses service role key for admin operations)
// Falls back to anon key if service role key is not available
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isServiceRoleAvailable = serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here';

export const supabaseAdmin = createClient(
  supabaseUrl,
  isServiceRoleAvailable ? serviceRoleKey! : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
