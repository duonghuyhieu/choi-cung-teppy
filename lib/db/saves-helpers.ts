import { supabaseAdmin } from '../supabase/client';
import { SaveFileWithUser } from '@/types';

export async function getAllPublicSaves(): Promise<SaveFileWithUser[]> {
  const { data, error } = await supabaseAdmin
    .from('save_files')
    .select(
      `
      *,
      user:users(id, username, email),
      game:games(id, name)
    `
    )
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((item: any) => ({
    ...item,
    user: {
      id: item.user.id,
      username: item.user.username,
      email: item.user.email,
    },
    game: item.game,
  }));
}

export async function deleteSaveById(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('save_files')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
