# 🚀 Quick Start - Steam Accounts

## Cách thêm tài khoản Steam vào game

### Cách 1: Trong form tạo/edit game (Khuyến nghị)

1. **Tạo game mới** hoặc **Edit game**
2. Chọn **Loại Game**: `Steam Offline` hoặc `Steam Online`
3. Kéo xuống phần **"Tài khoản Steam"** (có icon 🔑)
4. Click **"Thêm Account"**
5. Điền thông tin:
   - **Type**: Steam Offline / Steam Online
   - **Username**: Tên đăng nhập
   - **Password**: Mật khẩu
   - **Guard Link**: Link Steam Guard (optional)
6. Click **"Thêm Account"**
7. Lặp lại để thêm nhiều accounts
8. Click **"Tạo Game"** hoặc **"Lưu thay đổi"**

✅ Accounts sẽ được tự động lưu cùng với game!

### Cách 2: Trong tab Accounts (Admin Panel)

1. Vào **Admin Panel** → Tab **🔑 Accounts**
2. Chọn game từ dropdown
3. Click **"Add Account"**
4. Điền thông tin và click **"Create Account"**

---

## Phân biệt 3 loại game

### 🎮 Crack
- Không có tài khoản
- Chỉ có link tải và save files
- **Không hiển thị phần "Tài khoản Steam"** trong form

### 🔵 Steam Offline
- Có tài khoản (username/password/guard)
- **Không giới hạn** số người dùng
- User click "View Details" để xem thông tin
- Phù hợp cho: Game offline, single player

### 🟣 Steam Online
- Có tài khoản (username/password/guard)
- **Chỉ 1 người** dùng tại 1 thời điểm
- User chọn số giờ và click "Get Now"
- Tự động trả account khi hết giờ
- Phù hợp cho: Game online, multiplayer

---

## Ví dụ thực tế

### Tạo game Cyberpunk 2077 (Crack)
```
Tên Game: Cyberpunk 2077
Loại Game: Crack
Save File Path: %APPDATA%/CD Projekt Red/Cyberpunk 2077/saves/*.dat
Link tải: [Thêm các link Google Drive...]
```
→ Không cần thêm accounts

### Tạo game Elden Ring (Steam Offline)
```
Tên Game: Elden Ring
Loại Game: Steam Offline
Save File Path: %APPDATA%/EldenRing/saves/*.sl2

Tài khoản Steam:
- Username: player1@gmail.com
- Password: pass123
- Type: Steam Offline

- Username: player2@gmail.com  
- Password: pass456
- Type: Steam Offline
```
→ Mọi người có thể lấy bất kỳ account nào

### Tạo game GTA V Online (Steam Online)
```
Tên Game: GTA V Online
Loại Game: Steam Online
Save File Path: %USERPROFILE%/Documents/Rockstar Games/GTA V/Profiles/*.dat

Tài khoản Steam:
- Username: gtaplayer1@gmail.com
- Password: gta123
- Type: Steam Online

- Username: gtaplayer2@gmail.com
- Password: gta456
- Type: Steam Online
```
→ Chỉ 1 người dùng 1 account tại 1 thời điểm

---

## Tips

💡 **Khi nào dùng Steam Offline?**
- Game single player
- Không cần online
- Muốn nhiều người chơi cùng lúc (khác save)

💡 **Khi nào dùng Steam Online?**
- Game multiplayer
- Cần online để chơi
- Muốn quản lý lượt chơi (tránh conflict)

💡 **Thêm nhiều accounts**
- Thêm nhiều accounts để tăng khả năng available
- Steam Online: Nhiều accounts = nhiều người chơi cùng lúc

---

## Xem thêm

- **Chi tiết đầy đủ**: `STEAM_ACCOUNTS_GUIDE.md`
- **Hướng dẫn migration**: `MIGRATION_INSTRUCTIONS.md`
- **Changelog**: `CHANGELOG_STEAM_ACCOUNTS.md`
