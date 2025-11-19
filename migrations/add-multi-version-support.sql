-- ============================================
-- Migration: Add Multi-Version Support
-- Cho phép 1 game có nhiều phiên bản (Crack + Steam Offline + Steam Online)
-- ============================================

-- 1. Thêm cột version_type vào bảng download_links
ALTER TABLE download_links 
ADD COLUMN IF NOT EXISTS version_type VARCHAR(20) DEFAULT 'crack' 
CHECK (version_type IN ('crack', 'steam_offline', 'steam_online'));

-- Index cho version_type
CREATE INDEX IF NOT EXISTS idx_download_links_version_type ON download_links(version_type);

-- 2. Update existing links to 'crack' if not set
UPDATE download_links 
SET version_type = 'crack' 
WHERE version_type IS NULL;

-- ============================================
-- DONE! Migration completed
-- ============================================
-- Giờ 1 game có thể có:
-- - Link crack (version_type = 'crack')
-- - Link Steam Offline (version_type = 'steam_offline') + accounts
-- - Link Steam Online (version_type = 'steam_online') + accounts
-- ============================================
