export interface Game {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  save_file_path: string; // Template path: %APPDATA%/GameName/saves/*.sav
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGameDto {
  name: string;
  description?: string;
  thumbnail_url?: string;
  save_file_path: string;
  links?: { title: string; url: string }[];
}

export interface UpdateGameDto {
  name?: string;
  description?: string;
  thumbnail_url?: string;
  save_file_path?: string;
  links?: { title: string; url: string }[];
}

export interface DownloadLink {
  id: string;
  game_id: string;
  title?: string; // e.g., "Part 1", "Part 2", "Main Game"
  url: string;
  platform: string; // e.g., "PC", "Steam", "GOG"
  version: string | null; // e.g., "1.0.0"
  file_size: string | number | null; // e.g., "2.5 GB" or number in bytes
  created_at: string;
}

export interface CreateDownloadLinkDto {
  game_id: string;
  title?: string;
  url: string;
  platform: string;
  version?: string | null;
  file_size?: string | number | null;
}

export interface GameWithLinks extends Game {
  download_links: DownloadLink[];
}
