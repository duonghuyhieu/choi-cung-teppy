# 🎮 Hướng dẫn sử dụng Steam Accounts

## 📋 Tổng quan

Hệ thống hỗ trợ 3 loại game:

### 1. **Crack** (Game crack thông thường)
- Không có tài khoản đăng nhập
- Chỉ có link tải game và save files
- Không cần quản lý accounts

### 2. **Steam Offline** (Tài khoản Steam dùng offline)
- Có tài khoản (username/password/guard link)
- **Không giới hạn** số người dùng cùng lúc
- Mọi người có thể lấy tài khoản thoải mái
- Vẫn có thể upload/download save files

### 3. **Steam Online** (Tài khoản Steam dùng online)
- Có tài khoản (username/password/guard link)
- **Chỉ 1 người** được dùng tại 1 thời điểm
- Không đặt lịch trước, chỉ có nút "Lấy ngay"
- Chọn số giờ muốn chơi (1h, 2h, 4h, 8h, 12h, 24h)
- Tự động trả tài khoản khi hết thời gian
- Vẫn có thể upload/download save files

---

## 🔧 Cách sử dụng (Admin)

### Bước 1: Tạo Game
1. Vào **Admin Panel** → Tab **Games**
2. Click **"Thêm Game Mới"**
3. Điền thông tin:
   - **Tên Game**: Tên game
   - **Loại Game**: Chọn `Crack`, `Steam Offline`, hoặc `Steam Online`
   - **Save File Path**: Đường dẫn save file
   - **Mô tả**: Mô tả game (optional)
   - **Thumbnail URL**: Link ảnh thumbnail (optional)
   - **Link tải Game**: Thêm các link tải (optional)
4. Click **"Tạo Game"**

### Bước 2: Thêm Accounts (chỉ cho Steam games)
1. Vào **Admin Panel** → Tab **Accounts**
2. Chọn game từ dropdown
3. Click **"Add Account"**
4. Điền thông tin:
   - **Type**: `Steam Offline` hoặc `Steam Online`
   - **Username**: Tên đăng nhập Steam
   - **Password**: Mật khẩu Steam
   - **Guard Link**: Link Steam Guard (optional)
5. Click **"Create Account"**

### Bước 3: Quản lý Accounts
- **Xem danh sách**: Chọn game để xem tất cả accounts
- **Xóa account**: Click nút "Delete" bên cạnh account
- **Xem trạng thái**: 
  - Steam Offline: Luôn available
  - Steam Online: Hiển thị ai đang dùng + thời gian còn lại

---

## 👥 Cách sử dụng (User)

### Steam Offline
1. Vào trang game
2. Xem danh sách **"Steam Offline Accounts"**
3. Click **"View Details"** để xem username/password
4. Dùng tài khoản thoải mái, không giới hạn

### Steam Online
1. Vào trang game
2. Xem danh sách **"Steam Online Accounts"**
3. Nếu account **Available** (màu xanh):
   - Chọn số giờ muốn chơi (1h, 2h, 4h, 8h, 12h, 24h)
   - Click **"Get Now"**
   - Hệ thống sẽ assign account cho bạn
4. Nếu account **In use** (màu đỏ):
   - Hiển thị ai đang dùng
   - Hiển thị thời gian còn lại
   - Đợi đến khi hết thời gian
5. Khi đang dùng account:
   - Click **"Release"** để trả account sớm (nếu không cần nữa)

---

## 🔄 Logic tự động

### Reset tài khoản hết hạn
- Khi user lấy account, hệ thống set `in_use_until = NOW() + số giờ`
- Khi load danh sách accounts, hệ thống tự động check:
  - Nếu `NOW() > in_use_until` → Reset `in_use_by` và `in_use_until` về `null`
- **Không cần cron job**, tự động xử lý khi đọc dữ liệu

### Kiểm tra trạng thái
- API `/api/accounts/[id]/status` trả về:
  - `is_available`: true/false
  - `in_use_by`: User đang dùng (nếu có)
  - `time_remaining`: Số giây còn lại (nếu đang được dùng)

---

## 📡 API Endpoints

### Game Accounts
- `GET /api/games/[id]/accounts` - Lấy danh sách accounts của game
- `POST /api/games/[id]/accounts` - Tạo account mới (admin only)

### Account Management
- `GET /api/accounts/[id]` - Lấy thông tin account
- `PATCH /api/accounts/[id]` - Cập nhật account (admin only)
- `DELETE /api/accounts/[id]` - Xóa account (admin only)
- `GET /api/accounts/[id]/status` - Lấy trạng thái account

### Steam Online Actions
- `POST /api/accounts/[id]/assign` - Lấy account (body: `{ hours: number }`)
- `POST /api/accounts/[id]/release` - Trả account

### User Accounts
- `GET /api/users/[id]/active-accounts` - Lấy danh sách accounts đang dùng

---

## 🗄️ Database Schema

### Bảng `games`
```sql
ALTER TABLE games 
ADD COLUMN game_type VARCHAR(20) DEFAULT 'crack' 
CHECK (game_type IN ('crack', 'steam_offline', 'steam_online'));
```

### Bảng `game_accounts`
```sql
CREATE TABLE game_accounts (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  type VARCHAR(20) CHECK (type IN ('steam_offline', 'steam_online')),
  username VARCHAR(255),
  password VARCHAR(255),
  guard_link VARCHAR(500),
  in_use_by UUID REFERENCES users(id),
  in_use_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

---

## 🚀 Migration

Chạy file SQL migration:
```bash
# Trong Supabase SQL Editor
migrations/add-steam-support.sql
```

---

## ✅ Checklist triển khai

- [x] Tạo migration SQL
- [x] Thêm types cho GameAccount
- [x] Cập nhật Game types với game_type
- [x] Tạo database helpers (game-accounts.ts)
- [x] Tạo API routes cho CRUD accounts
- [x] Tạo API routes cho assign/release
- [x] Tạo AdminAccountsTab component
- [x] Tạo GameAccountsSection component
- [x] Cập nhật GameForm với game_type selector
- [x] Cập nhật Admin page với Accounts tab
- [x] Cập nhật Game detail page với accounts section

---

## 🎯 Lưu ý

1. **Crack games**: Không liên quan gì đến `game_accounts`, chỉ dùng `download_links` và `save_files`
2. **Steam Offline**: Dùng `game_accounts` nhưng không dùng `in_use_by` và `in_use_until`
3. **Steam Online**: Dùng đầy đủ các trường trong `game_accounts`
4. **Save files**: Tất cả 3 loại game đều có thể dùng `save_files`
5. **Không có bảng lịch sử**: Không lưu lịch sử ai đã dùng account khi nào
6. **Tự động reset**: Không cần cron job, tự động reset khi đọc dữ liệu

---

## 🐛 Troubleshooting

### Account không tự động reset
- Check function `reset_expired_accounts()` đã được tạo chưa
- Check API có gọi `resetExpiredAccounts()` trước khi đọc dữ liệu không

### Không thể assign account
- Check account có đang được dùng không (`in_use_until > NOW()`)
- Check user có đăng nhập không
- Check account type có phải `steam_online` không

### Không thấy tab Accounts
- Check user có role `admin` không
- Check đã import `AdminAccountsTab` component chưa
- Check đã load games trong admin page chưa
