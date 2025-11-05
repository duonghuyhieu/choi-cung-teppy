import { supabaseAdmin } from '../supabase/client';
import { User } from '@/types';

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    return null;
  }

  return data;
}
