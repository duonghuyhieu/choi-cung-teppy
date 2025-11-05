// Re-export types from shared
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  save_file_path: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SaveFile {
  id: string;
  game_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  is_public: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveFileWithUser extends SaveFile {
  user: {
    id: string;
    username: string;
  };
}

export interface GameWithLinks extends Game {
  download_links: DownloadLink[];
}

export interface DownloadLink {
  id: string;
  game_id: string;
  url: string;
  platform: string;
  version: string | null;
  file_size: number | null;
  created_at: string;
}
