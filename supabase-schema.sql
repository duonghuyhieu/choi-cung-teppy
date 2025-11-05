-- ============================================
-- Game Saver - Supabase Database Schema
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 2. GAMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  save_file_path VARCHAR(500) NOT NULL, -- Template: %APPDATA%/GameName/saves/*.sav
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_games_name ON games(name);
CREATE INDEX IF NOT EXISTS idx_games_created_by ON games(created_by);

-- ============================================
-- 3. DOWNLOAD LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS download_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  url VARCHAR(1000) NOT NULL,
  platform VARCHAR(50) DEFAULT 'windows',
  version VARCHAR(50),
  file_size BIGINT, -- bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_download_links_game ON download_links(game_id);

-- ============================================
-- 4. SAVE FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS save_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Mỗi user chỉ có 1 save file cùng tên cho 1 game
  UNIQUE(game_id, user_id, file_name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_save_files_game ON save_files(game_id);
CREATE INDEX IF NOT EXISTS idx_save_files_user ON save_files(user_id);
CREATE INDEX IF NOT EXISTS idx_save_files_game_user ON save_files(game_id, user_id);
CREATE INDEX IF NOT EXISTS idx_save_files_public ON save_files(is_public) WHERE is_public = TRUE;

-- ============================================
-- 5. AUDIT LOGS TABLE (Optional - Track admin actions)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 6. FUNCTIONS - Auto update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_save_files_updated_at BEFORE UPDATE ON save_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_files ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Games table policies (Public read)
CREATE POLICY "Anyone can view games" ON games
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert games" ON games
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update games" ON games
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete games" ON games
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Download links policies
CREATE POLICY "Anyone can view download links" ON download_links
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage download links" ON download_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Save files policies
CREATE POLICY "Users can view their own saves and public saves" ON save_files
  FOR SELECT USING (
    user_id = auth.uid() OR is_public = true
  );

CREATE POLICY "Users can insert their own saves" ON save_files
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saves" ON save_files
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saves" ON save_files
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all saves" ON save_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- 8. STORAGE BUCKET (Run in Storage section)
-- ============================================
-- Tạo bucket 'save-files' trong Supabase Storage Dashboard
-- Sau đó chạy policies sau trong SQL Editor:

-- Storage policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('save-files', 'save-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Users can upload save files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'save-files');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'save-files' AND owner = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'save-files' AND owner = auth.uid());

-- Allow users to read files (authenticated only)
CREATE POLICY "Authenticated users can download files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'save-files');

-- ============================================
-- 9. INITIAL DATA - Create default admin user
-- ============================================
-- Password: admin123 (hash using bcrypt, rounds=10)
-- IMPORTANT: Thay đổi password sau khi login lần đầu!
INSERT INTO users (email, username, password_hash, role)
VALUES (
  'admin@gamesaver.com',
  'admin',
  '$2a$10$rKvvJZ5aXWVF0ZqXQXqXQeYgKZKZKZKZKZKZKZKZKZKZKZKZKZK', -- Placeholder, bạn sẽ tạo qua API
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- DONE! Schema created successfully
-- ============================================
-- Next steps:
-- 1. Tạo admin user qua API /api/auth/register
-- 2. Upload thumbnail images to Supabase Storage
-- 3. Test RLS policies
-- ============================================
