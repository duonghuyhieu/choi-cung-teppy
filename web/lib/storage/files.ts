import { supabase, supabaseAdmin } from '../supabase/client';

const BUCKET_NAME = 'save-files';

export async function uploadFile(
  file: File,
  userId: string,
  gameId: string
): Promise<{ url: string; size: number }> {
  // Create unique file path: userId/gameId/timestamp-filename
  const timestamp = Date.now();
  const filePath = `${userId}/${gameId}/${timestamp}-${file.name}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return {
    url: publicUrl,
    size: file.size,
  };
}

export async function deleteFile(fileUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    throw new Error('Invalid file URL');
  }

  const filePath = urlParts[1];

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function getSignedDownloadUrl(
  fileUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  // Extract file path from URL
  const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    throw new Error('Invalid file URL');
  }

  const filePath = urlParts[1];

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}
