export interface SaveFile {
  id: string;
  game_id: string;
  user_id: string;
  file_name: string;
  file_url: string; // URL from storage
  file_size: number; // bytes
  is_public: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSaveFileDto {
  game_id: string;
  file_name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateSaveFileDto {
  description?: string;
  is_public?: boolean;
}

export interface SaveFileWithUser extends SaveFile {
  user: {
    id: string;
    username: string;
  };
}

export interface UploadSaveResponse {
  save_file: SaveFile;
  upload_url: string; // Presigned URL for upload
}

export interface DownloadSaveResponse {
  download_url: string; // Presigned URL for download
}
