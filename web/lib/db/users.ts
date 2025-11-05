import { supabaseAdmin } from '../supabase/client';
import { User, CreateUserDto } from '@/types';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function createUser(data: CreateUserDto): Promise<User> {
  // Hash password
  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Auto-generate email from username
  const email = `${data.username}@gamesaver.local`;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      username: data.username,
      password_hash,
      role: data.role || 'user',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return user;
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

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
