import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client (uses service role key for admin operations)
// Falls back to anon key if service role key is not available
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isServiceRoleAvailable = serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  isServiceRoleAvailable ? serviceRoleKey! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
