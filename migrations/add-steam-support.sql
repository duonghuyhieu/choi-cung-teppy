-- ============================================
-- Migration: Add Steam Offline & Steam Online Support
-- ============================================

-- 1. Thêm cột game_type vào bảng games
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS game_type VARCHAR(20) DEFAULT 'crack' 
CHECK (game_type IN ('crack', 'steam_offline', 'steam_online'));

-- Index cho game_type
CREATE INDEX IF NOT EXISTS idx_games_game_type ON games(game_type);

-- 2. Tạo bảng game_accounts (chỉ cho Steam)
CREATE TABLE IF NOT EXISTS game_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('steam_offline', 'steam_online')),
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  guard_link VARCHAR(500),
  
  -- Chỉ dùng cho Steam Online
  in_use_by UUID REFERENCES users(id) ON DELETE SET NULL,
  in_use_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Mỗi game chỉ có 1 username duy nhất
  UNIQUE(game_id, username)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_accounts_game ON game_accounts(game_id);
CREATE INDEX IF NOT EXISTS idx_game_accounts_type ON game_accounts(type);
CREATE INDEX IF NOT EXISTS idx_game_accounts_in_use ON game_accounts(in_use_by) WHERE in_use_by IS NOT NULL;

-- 3. Trigger auto update timestamp
CREATE TRIGGER update_game_accounts_updated_at BEFORE UPDATE ON game_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Function tự động reset tài khoản hết hạn
CREATE OR REPLACE FUNCTION reset_expired_accounts()
RETURNS void AS $$
BEGIN
  UPDATE game_accounts
  SET 
    in_use_by = NULL,
    in_use_until = NULL
  WHERE 
    type = 'steam_online' 
    AND in_use_until IS NOT NULL 
    AND NOW() > in_use_until;
END;
$$ LANGUAGE plpgsql;

-- 5. Row Level Security
ALTER TABLE game_accounts ENABLE ROW LEVEL SECURITY;

-- Anyone can view accounts (để hiển thị danh sách)
CREATE POLICY "Anyone can view game accounts" ON game_accounts
  FOR SELECT USING (true);

-- Only admins can insert accounts
CREATE POLICY "Only admins can insert game accounts" ON game_accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can update accounts (except in_use_by/in_use_until)
CREATE POLICY "Only admins can update game accounts" ON game_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can delete accounts
CREATE POLICY "Only admins can delete game accounts" ON game_accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can update in_use_by/in_use_until for steam_online (via API)
-- This will be handled by service role in API

-- ============================================
-- DONE! Migration completed
-- ============================================
