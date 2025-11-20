-- ============================================
-- Migration: Make save_file_path optional
-- Cho phép save_file_path có thể NULL
-- ============================================

-- Bỏ NOT NULL constraint cho save_file_path
ALTER TABLE games
ALTER COLUMN save_file_path DROP NOT NULL;

-- ============================================
-- DONE! Migration completed
-- ============================================
-- Giờ save_file_path không bắt buộc
-- Games không có save_file_path thì CLI sẽ không có auto-sync feature
-- ============================================
