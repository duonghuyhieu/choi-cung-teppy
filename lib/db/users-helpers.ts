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

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function findUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
  // Try to find by username first
  let user = await findUserByUsername(usernameOrEmail);

  // If not found, try email
  if (!user) {
    user = await findUserByEmail(usernameOrEmail);
  }

  return user;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const bcrypt = require('bcryptjs');
  const SALT_ROUNDS = 10;
  
  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const { error } = await supabaseAdmin
    .from('users')
    .update({ password_hash })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateUserInfo(userId: string, data: { username?: string; email?: string; role?: 'admin' | 'user' }): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .update(data)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
