import { supabaseAdmin } from '../supabase/client';
import {
  SaveFile,
  CreateSaveFileDto,
  UpdateSaveFileDto,
  SaveFileWithUser,
} from '@/types';

export async function createSaveFile(
  data: CreateSaveFileDto,
  userId: string,
  fileUrl: string,
  fileSize: number
): Promise<SaveFile> {
  const { data: saveFile, error } = await supabaseAdmin
    .from('save_files')
    .insert({
      game_id: data.game_id,
      user_id: userId,
      file_name: data.file_name,
      file_url: fileUrl,
      file_size: fileSize,
      description: data.description,
      is_public: data.is_public || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return saveFile;
}

export async function getSaveFilesByGame(
  gameId: string,
  userId?: string
): Promise<SaveFileWithUser[]> {
  let query = supabaseAdmin
    .from('save_files')
    .select(
      `
      *,
      user:users(id, username)
    `
    )
    .eq('game_id', gameId);

  // If userId provided, get public saves + user's own saves
  if (userId) {
    query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
  } else {
    // Public only if no user
    query = query.eq('is_public', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((item: any) => ({
    ...item,
    user: {
      id: item.user.id,
      username: item.user.username,
    },
  }));
}

export async function getSaveFileById(id: string): Promise<SaveFile | null> {
  const { data, error } = await supabaseAdmin
    .from('save_files')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getUserSaveFiles(userId: string): Promise<SaveFile[]> {
  const { data, error } = await supabaseAdmin
    .from('save_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function updateSaveFile(
  id: string,
  data: UpdateSaveFileDto
): Promise<SaveFile> {
  const { data: saveFile, error } = await supabaseAdmin
    .from('save_files')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return saveFile;
}

export async function deleteSaveFile(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('save_files').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function checkSaveFileOwnership(
  id: string,
  userId: string
): Promise<boolean> {
  const saveFile = await getSaveFileById(id);
  return saveFile?.user_id === userId;
}
