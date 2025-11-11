import { supabase, supabaseAdmin } from '../supabase/client';

const BUCKET_NAME = 'save-files';

// Sanitize filename for storage (remove special chars, keep extension)
function sanitizeFilename(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.'));
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));

  // Replace non-ASCII and special chars with underscore
  const sanitized = nameWithoutExt
    .normalize('NFD') // Decompose Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/_{2,}/g, '_') // Collapse multiple underscores
    .substring(0, 100); // Limit length

  return sanitized + ext;
}

export async function uploadFile(
  file: File,
  userId: string,
  gameId: string
): Promise<{ url: string; size: number }> {
  // Create unique file path with sanitized filename
  const timestamp = Date.now();
  const sanitizedName = sanitizeFilename(file.name);
  const filePath = `${userId}/${gameId}/${timestamp}-${sanitizedName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting existing files
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
    .createSignedUrl(filePath, expiresIn, {
      download: true, // Force download instead of opening in browser
    });

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}
