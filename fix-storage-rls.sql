-- Fix Storage RLS để cho phép upload
-- Chạy trong Supabase SQL Editor

-- Tạo policy cho bucket save-files
-- IMPORTANT: Bucket 'save-files' phải được tạo trước trong Storage UI

-- 1. Cho phép tất cả mọi người upload (dùng service role)
CREATE POLICY "Allow service role to upload" ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'save-files');

-- 2. Cho phép tất cả mọi người xem
CREATE POLICY "Allow public to view" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'save-files');

-- 3. Cho phép service role xóa
CREATE POLICY "Allow service role to delete" ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'save-files');

-- 4. Cho phép service role update
CREATE POLICY "Allow service role to update" ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'save-files');
