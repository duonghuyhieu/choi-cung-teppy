# Fix Upload Error: "new row violates row-level security policy"

## Nguyên nhân

Lỗi này xảy ra vì **Service Role Key** chưa được cấu hình, khiến app không thể bypass RLS policies của Supabase.

## Giải pháp

### Bước 1: Lấy Service Role Key

1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Tìm **Project API keys** section
5. Copy **service_role key** (⚠️ KHÔNG phải anon key!)

### Bước 2: Thêm vào Environment Variables

#### Local Development (.env.local):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

#### Vercel Deployment:

1. Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Thêm biến mới:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste service role key)
   - **Environment**: All (Production, Preview, Development)
3. Click **Save**
4. **Redeploy** project

### Bước 3: Chạy Storage Policies SQL

Mở **Supabase SQL Editor** và chạy:

```sql
-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage files
CREATE POLICY "Service role can manage save-files" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'save-files')
  WITH CHECK (bucket_id = 'save-files');

-- Allow public to view files
CREATE POLICY "Public can view save-files" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'save-files');
```

### Bước 4: Restart Server

#### Local:
```bash
# Ctrl + C để stop server
npm run dev
```

#### Vercel:
- Deployment tự động restart sau khi thêm env variable và redeploy

## Kiểm tra

Sau khi hoàn thành các bước trên:

1. Đăng nhập vào web
2. Vào trang Game Detail
3. Click **"Upload Save"**
4. Chọn file và upload

✅ Upload thành công!

## Troubleshooting

### Vẫn báo lỗi?

1. **Kiểm tra service role key đã đúng chưa:**
   - Key phải bắt đầu bằng `eyJ...`
   - Key rất dài (hàng trăm ký tự)
   - KHÔNG phải là anon key

2. **Kiểm tra storage bucket:**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'save-files';
   ```
   - Nếu không có, tạo bucket trong Storage UI

3. **Kiểm tra policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   ```
   - Phải có policies cho service_role

4. **Restart lại server:**
   - Local: Kill và start lại
   - Vercel: Force redeploy

## Bảo mật

⚠️ **QUAN TRỌNG**: Service Role Key có quyền admin!

- ❌ KHÔNG commit vào git
- ❌ KHÔNG share công khai
- ✅ Chỉ dùng server-side
- ✅ Lưu trong environment variables

Service role key đã được cấu hình đúng trong code để chỉ chạy server-side.
