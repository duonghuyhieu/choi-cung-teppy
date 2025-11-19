# 🎮 Hướng dẫn nhanh cho Admin

## Thêm Game Mới

### Bước 1: Mở form thêm game
1. Vào **Admin Panel** → Tab **Games**
2. Click nút **"Thêm Game"**

### Bước 2: Tab "Thông tin chung"
Điền các thông tin cơ bản:

- **Tên Game** *(bắt buộc)*: Ví dụ "Cyberpunk 2077"
- **Loại Game** *(bắt buộc)*: Chọn 1 trong 3:
  - 🎮 **Crack** - Game crack thông thường (chỉ có link tải)
  - 🔵 **Steam Offline** - Có tài khoản Steam, không giới hạn người dùng
  - 🟣 **Steam Online** - Có tài khoản Steam, chỉ 1 người/lúc
- **Save File Path** *(bắt buộc)*: Đường dẫn save file
  - Ví dụ: `%APPDATA%/GameName/saves/*.sav`
- **Mô tả**: Mô tả ngắn về game (optional)
- **Thumbnail URL**: Link ảnh thumbnail (optional)

### Bước 3: Tab "Content" (Crack/Steam Offline/Steam Online)
Tên tab sẽ thay đổi theo loại game bạn chọn ở Bước 2.

#### Nếu chọn "Crack":
- Chỉ cần thêm **Link tải Game**
- Click "Thêm Link" → Điền tên và URL → Click "Thêm"
- Có thể thêm nhiều links (Part 1, Part 2...)

#### Nếu chọn "Steam Offline" hoặc "Steam Online":
1. **Thêm Tài khoản Steam**:
   - Click "Thêm Account"
   - Điền:
     - Username: Tên đăng nhập Steam
     - Password: Mật khẩu
     - Guard Link: Link Steam Guard (optional)
   - Click "Thêm Account"
   - Có thể thêm nhiều accounts

2. **Thêm Link tải Game**:
   - Click "Thêm Link"
   - Điền tên link và URL
   - Click "Thêm"
   - Có thể thêm nhiều links

### Bước 4: Lưu game
- Click nút **"Tạo Game"**
- Game sẽ được tạo cùng với tất cả links và accounts!

---

## Sửa Game

1. Vào **Admin Panel** → Tab **Games**
2. Click icon ✏️ (Sửa) bên cạnh game muốn sửa
3. Chỉnh sửa thông tin trong 2 tabs
4. Click **"Lưu thay đổi"**

**Lưu ý**: 
- Có thể thêm/xóa links và accounts khi sửa
- Xóa account sẽ xóa luôn trên server

---

## Xóa Game

1. Vào **Admin Panel** → Tab **Games**
2. Click icon 🗑️ (Xóa) bên cạnh game muốn xóa
3. Xác nhận xóa

**Cảnh báo**: Xóa game sẽ xóa luôn tất cả links, accounts và save files liên quan!

---

## Quản lý Accounts (Tab Accounts)

Ngoài việc thêm accounts trong form game, bạn có thể quản lý tập trung:

1. Vào **Admin Panel** → Tab **🔑 Accounts**
2. Chọn game từ dropdown
3. Xem danh sách accounts
4. Thêm/Xóa accounts

---

## Phân biệt 3 loại game

### 🎮 Crack
**Khi nào dùng:**
- Game single player
- Không cần Steam
- Chỉ cần link tải

**Ví dụ:**
- Cyberpunk 2077 Crack
- The Witcher 3 Crack

**User thấy gì:**
- Chỉ có link tải game
- Không có phần accounts

---

### 🔵 Steam Offline
**Khi nào dùng:**
- Có tài khoản Steam
- Chơi offline
- Nhiều người có thể dùng cùng lúc (khác save)

**Ví dụ:**
- Elden Ring (offline mode)
- Dark Souls 3 (offline mode)

**User thấy gì:**
- Section "Steam Offline Accounts"
- Click "View Details" để xem username/password
- Không giới hạn, ai cũng lấy được

---

### 🟣 Steam Online
**Khi nào dùng:**
- Cần online để chơi
- Multiplayer
- Muốn quản lý lượt chơi

**Ví dụ:**
- GTA V Online
- CS:GO

**User thấy gì:**
- Section "Steam Online Accounts"
- Chọn số giờ (1h, 2h, 4h, 8h, 12h, 24h)
- Click "Get Now" để lấy account
- Nếu đang được dùng → Hiển thị ai đang dùng + thời gian còn lại
- Tự động trả account khi hết giờ

---

## Tips

### 💡 Thêm nhiều accounts
- Steam Offline: Thêm nhiều accounts để nhiều người chơi
- Steam Online: Thêm nhiều accounts để tăng khả năng available

### 💡 Thêm nhiều links
- Chia file lớn thành nhiều parts
- Cung cấp nhiều nguồn tải (Google Drive, MEGA...)

### 💡 Chọn loại game phù hợp
- **Crack**: Đơn giản nhất, chỉ cần link
- **Steam Offline**: Có account nhưng không giới hạn
- **Steam Online**: Có account và giới hạn thời gian

### 💡 Save File Path
Một số ví dụ phổ biến:
- `%APPDATA%/GameName/saves/*.sav`
- `%USERPROFILE%/Documents/GameName/Profiles/*.dat`
- `%LOCALAPPDATA%/GameName/Saved/SaveGames/*.sav`

---

## Xem thêm

- **Chi tiết đầy đủ**: `STEAM_ACCOUNTS_GUIDE.md`
- **Quick Start**: `QUICK_START.md`
- **Migration**: `MIGRATION_INSTRUCTIONS.md`
