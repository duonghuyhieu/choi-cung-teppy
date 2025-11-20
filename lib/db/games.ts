import { supabaseAdmin } from '../supabase/client';
import {
  Game,
  CreateGameDto,
  UpdateGameDto,
  DownloadLink,
  CreateDownloadLinkDto,
  GameWithLinks,
} from '@/types';

// ===== GAMES =====

export async function createGame(
  data: CreateGameDto,
  userId: string
): Promise<Game> {
  const { data: game, error } = await supabaseAdmin
    .from('games')
    .insert({
      name: data.name,
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      save_file_path: data.save_file_path || null,
      game_type: data.game_type && data.game_type.length > 0 ? data.game_type : ['crack'],
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create download links if provided
  if (data.links && data.links.length > 0) {
    await createMultipleDownloadLinks(game.id, data.links);
  }

  return game;
}

export async function createGameWithLinks(
  data: CreateGameDto,
  userId: string
): Promise<GameWithLinks> {
  const game = await createGame(data, userId);
  const links = await getDownloadLinksByGame(game.id);

  return {
    ...game,
    download_links: links,
  };
}

export async function getAllGames(): Promise<Game[]> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getGameById(id: string): Promise<Game | null> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getGameWithLinks(id: string): Promise<GameWithLinks | null> {
  const game = await getGameById(id);
  if (!game) return null;

  const links = await getDownloadLinksByGame(id);

  return {
    ...game,
    download_links: links,
  };
}

export async function updateGame(
  id: string,
  data: UpdateGameDto
): Promise<Game> {
  const { links, ...gameData } = data;

  const { data: game, error } = await supabaseAdmin
    .from('games')
    .update(gameData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update download links if provided
  if (links !== undefined) {
    // Delete existing links and create new ones
    await supabaseAdmin
      .from('download_links')
      .delete()
      .eq('game_id', id);

    if (links.length > 0) {
      await createMultipleDownloadLinks(id, links);
    }
  }

  return game;
}

export async function updateGameWithLinks(
  id: string,
  data: UpdateGameDto
): Promise<GameWithLinks> {
  const game = await updateGame(id, data);
  const links = await getDownloadLinksByGame(id);

  return {
    ...game,
    download_links: links,
  };
}

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('games').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// ===== DOWNLOAD LINKS =====

export async function createDownloadLink(
  data: CreateDownloadLinkDto
): Promise<DownloadLink> {
  const { data: link, error } = await supabaseAdmin
    .from('download_links')
    .insert({
      game_id: data.game_id,
      title: data.title,
      url: data.url,
      file_size: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return link;
}

export async function createMultipleDownloadLinks(
  gameId: string,
  links: { title: string; url: string; version_type?: string }[]
): Promise<DownloadLink[]> {
  const linksToInsert = links.map((link) => ({
    game_id: gameId,
    title: link.title,
    url: link.url,
    file_size: null,
    version_type: link.version_type || 'crack',
  }));

  const { data, error } = await supabaseAdmin
    .from('download_links')
    .insert(linksToInsert)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getDownloadLinksByGame(
  gameId: string
): Promise<DownloadLink[]> {
  const { data, error } = await supabaseAdmin
    .from('download_links')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function deleteDownloadLink(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('download_links')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
