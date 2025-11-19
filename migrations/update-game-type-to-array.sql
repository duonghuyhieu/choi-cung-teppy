-- ============================================
-- Migration: Update game_type to support multiple types
-- ============================================

-- 1. Xóa constraint cũ
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_game_type_check;

-- 2. Xóa default cũ trước
ALTER TABLE games ALTER COLUMN game_type DROP DEFAULT;

-- 3. Đổi game_type thành array
-- Nếu game_type là NULL, convert thành array rỗng
-- Nếu game_type có giá trị, convert thành array 1 phần tử
ALTER TABLE games 
ALTER COLUMN game_type TYPE TEXT[] 
USING CASE 
  WHEN game_type IS NULL THEN ARRAY[]::TEXT[]
  ELSE ARRAY[game_type]::TEXT[]
END;

-- 4. Set default là array rỗng
ALTER TABLE games 
ALTER COLUMN game_type SET DEFAULT ARRAY[]::TEXT[];

-- 5. Update games hiện có: nếu null thì set thành array rỗng
UPDATE games 
SET game_type = ARRAY[]::TEXT[]
WHERE game_type IS NULL;

-- 6. Thêm constraint mới: chỉ chấp nhận các giá trị hợp lệ
ALTER TABLE games 
ADD CONSTRAINT games_game_type_check 
CHECK (
  game_type <@ ARRAY['crack', 'steam_offline', 'steam_online']::TEXT[]
);

-- ============================================
-- DONE! Migration completed
-- ============================================
-- Giờ game_type là array, có thể chứa:
-- - [] (rỗng)
-- - ['crack']
-- - ['steam_offline']
-- - ['steam_online']
-- - ['crack', 'steam_offline']
-- - ['crack', 'steam_online']
-- - ['steam_offline', 'steam_online']
-- - ['crack', 'steam_offline', 'steam_online']
-- ============================================
