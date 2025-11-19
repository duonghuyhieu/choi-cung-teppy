# 🚀 Hướng dẫn Migration - Steam Accounts

## Bước 1: Chạy Migration SQL

1. Mở **Supabase Dashboard**
2. Vào **SQL Editor**
3. Copy toàn bộ nội dung file `migrations/add-steam-support.sql`
4. Paste vào SQL Editor
5. Click **Run** để thực thi

Migration sẽ:
- ✅ Thêm cột `game_type` vào bảng `games`
- ✅ Tạo bảng `game_accounts`
- ✅ Tạo indexes
- ✅ Tạo triggers auto update timestamp
- ✅ Tạo function `reset_expired_accounts()`
- ✅ Thiết lập Row Level Security (RLS)

## Bước 2: Kiểm tra Migration

Chạy các query sau để kiểm tra:

```sql
-- Check cột game_type đã được thêm
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'games' AND column_name = 'game_type';

-- Check bảng game_accounts đã được tạo
SELECT * FROM game_accounts LIMIT 1;

-- Check function reset_expired_accounts
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'reset_expired_accounts';
```

## Bước 3: Update Games hiện có (Optional)

Nếu bạn đã có games trong database, chúng sẽ tự động có `game_type = 'crack'` (default).

Nếu muốn đổi sang Steam:

```sql
-- Đổi game sang Steam Offline
UPDATE games 
SET game_type = 'steam_offline' 
WHERE id = 'game-id-here';

-- Đổi game sang Steam Online
UPDATE games 
SET game_type = 'steam_online' 
WHERE id = 'game-id-here';
```

## Bước 4: Test hệ thống

### Test Admin Panel
1. Login với tài khoản admin
2. Vào **Admin Panel** → Tab **Accounts**
3. Chọn 1 game Steam
4. Thêm account mới
5. Kiểm tra account hiển thị đúng

### Test User View
1. Tạo 1 game Steam Online
2. Thêm 1 account cho game đó
3. Vào trang game detail
4. Kiểm tra section "Steam Online Accounts" hiển thị
5. Test nút "Get Now" với các số giờ khác nhau
6. Kiểm tra trạng thái "In use" hiển thị đúng
7. Test nút "Release"

### Test Auto Reset
1. Assign 1 account với 1 giờ
2. Đợi 1 giờ (hoặc update `in_use_until` trong database về quá khứ)
3. Refresh trang
4. Kiểm tra account tự động reset về "Available"

## Bước 5: Rollback (nếu cần)

Nếu có vấn đề, chạy SQL sau để rollback:

```sql
-- Xóa bảng game_accounts
DROP TABLE IF EXISTS game_accounts CASCADE;

-- Xóa function
DROP FUNCTION IF EXISTS reset_expired_accounts();

-- Xóa cột game_type
ALTER TABLE games DROP COLUMN IF EXISTS game_type;
```

## ⚠️ Lưu ý quan trọng

1. **Backup database** trước khi chạy migration
2. **Test trên môi trường dev** trước khi deploy production
3. **Kiểm tra RLS policies** để đảm bảo security
4. **Monitor performance** sau khi deploy

## 🐛 Troubleshooting

### Lỗi: "column game_type already exists"
- Cột đã tồn tại, skip bước thêm cột
- Hoặc chạy: `ALTER TABLE games DROP COLUMN game_type;` rồi chạy lại

### Lỗi: "table game_accounts already exists"
- Bảng đã tồn tại, skip bước tạo bảng
- Hoặc chạy: `DROP TABLE game_accounts CASCADE;` rồi chạy lại

### Lỗi: "function reset_expired_accounts already exists"
- Function đã tồn tại, skip bước tạo function
- Hoặc chạy: `DROP FUNCTION reset_expired_accounts();` rồi chạy lại

### Lỗi RLS: "permission denied"
- Check RLS policies đã được tạo đúng chưa
- Check user có role admin chưa
- Check service role key đã được set chưa

## 📞 Support

Nếu gặp vấn đề, check:
1. Supabase logs
2. Browser console
3. Network tab (API responses)
4. Database logs

---

✅ **Migration hoàn tất!** Giờ bạn có thể sử dụng Steam Offline và Steam Online accounts.
