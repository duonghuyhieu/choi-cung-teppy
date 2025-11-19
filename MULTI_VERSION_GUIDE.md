## 🎮 Hướng dẫn: 1 Game - Nhiều Phiên Bản

### Tính năng mới
Giờ đây, **1 game có thể có nhiều phiên bản** cùng lúc:
- ✅ **Crack** - Game crack với link tải
- ✅ **Steam Offline** - Tài khoản Steam offline + link tải
- ✅ **Steam Online** - Tài khoản Steam online + link tải

### Ví dụ thực tế

**Game: GTA V**
- **Tab Crack**: Link tải game crack từ Google Drive
- **Tab Steam Offline**: 3 tài khoản Steam + link tải từ Steam
- **Tab Steam Online**: 2 tài khoản Steam online + link tải từ Steam

→ User có thể chọn phiên bản phù hợp với nhu cầu!

---

## 📝 Cách sử dụng

### Bước 1: Tạo game mới
1. Vào **Admin Panel** → Tab **Games**
2. Click **"Thêm Game Mới"**
3. Sẽ thấy form với **4 tabs**:
   - 📋 **Thông tin chung**
   - 🎮 **Crack**
   - 🔵 **Steam Offline**
   - 🟣 **Steam Online**

### Bước 2: Điền thông tin chung (Tab 1)
- **Tên Game**: GTA V
- **Save File Path**: %USERPROFILE%/Documents/Rockstar Games/GTA V/Profiles/*.dat
- **Mô tả**: Game hành động thế giới mở
- **Thumbnail URL**: Link ảnh thumbnail

### Bước 3: Thêm phiên bản Crack (Tab 2)
1. Chuyển sang tab **🎮 Crack**
2. Click **"Thêm Link"**
3. Điền:
   - **Tên link**: Part 1
   - **URL**: https://drive.google.com/...
4. Thêm nhiều links nếu cần (Part 2, Part 3...)

### Bước 4: Thêm phiên bản Steam Offline (Tab 3)
1. Chuyển sang tab **🔵 Steam Offline**
2. **Thêm tài khoản**:
   - Click **"Thêm Account"**
   - Điền username, password, guard link
   - Thêm nhiều accounts nếu cần
3. **Thêm link tải**:
   - Click **"Thêm Link"**
   - Điền tên link và URL

### Bước 5: Thêm phiên bản Steam Online (Tab 4)
1. Chuyển sang tab **🟣 Steam Online**
2. **Thêm tài khoản**:
   - Click **"Thêm Account"**
   - Điền username, password, guard link
   - Thêm nhiều accounts nếu cần
3. **Thêm link tải**:
   - Click **"Thêm Link"**
   - Điền tên link và URL

### Bước 6: Lưu game
- Click **"Tạo Game"**
- Tất cả phiên bản sẽ được lưu cùng lúc!

---

## 🎯 Khi nào dùng từng phiên bản?

### 🎮 Crack
**Dùng khi:**
- Game single player
- Không cần Steam
- Muốn chơi offline hoàn toàn

**Ví dụ:**
- Cyberpunk 2077 Crack
- The Witcher 3 Crack
- Red Dead Redemption 2 Crack

### 🔵 Steam Offline
**Dùng khi:**
- Có tài khoản Steam
- Chơi offline (không cần online)
- Nhiều người có thể dùng cùng lúc (khác save)

**Ví dụ:**
- Elden Ring (chơi offline)
- Dark Souls 3 (chơi offline)
- Sekiro (chơi offline)

### 🟣 Steam Online
**Dùng khi:**
- Cần online để chơi
- Multiplayer
- Chỉ 1 người dùng tại 1 thời điểm

**Ví dụ:**
- GTA V Online
- CS:GO
- Dota 2

---

## 💡 Tips

### Có thể bỏ trống tab nào đó
- Không bắt buộc phải điền cả 3 phiên bản
- Ví dụ: Chỉ có Crack → Chỉ điền tab Crack
- Ví dụ: Chỉ có Steam Online → Chỉ điền tab Steam Online

### Thêm nhiều accounts
- Steam Offline: Thêm nhiều accounts để nhiều người chơi
- Steam Online: Thêm nhiều accounts để tăng khả năng available

### Thêm nhiều links
- Chia nhỏ file lớn thành nhiều parts
- Cung cấp nhiều nguồn tải (Google Drive, MEGA, MediaFire...)

---

## 🔄 Migration

Để sử dụng tính năng này, cần chạy migration:

```sql
-- Chạy trong Supabase SQL Editor
migrations/add-multi-version-support.sql
```

Migration sẽ:
- ✅ Thêm cột `version_type` vào bảng `download_links`
- ✅ Set default `version_type = 'crack'` cho links hiện có

---

## 📊 Hiển thị cho User

Khi user vào trang game detail, sẽ thấy:

### Nếu có phiên bản Crack
- Section "Link Tải Game" với các link crack

### Nếu có phiên bản Steam Offline
- Section "Steam Offline Accounts" với danh sách accounts
- Section "Link Tải Game (Steam Offline)"

### Nếu có phiên bản Steam Online
- Section "Steam Online Accounts" với nút "Get Now"
- Section "Link Tải Game (Steam Online)"

---

## ⚙️ Cấu hình

### Sử dụng component mới
Trong `AdminGamesTab.tsx`, thay thế `GameForm` bằng `GameFormWithTabs`:

```tsx
import GameFormWithTabs from '@/components/admin/GameFormWithTabs';

// Thay vì
<GameForm mode="create" ... />

// Dùng
<GameFormWithTabs mode="create" ... />
```

---

## 🎉 Kết quả

Giờ bạn có thể:
- ✅ Tạo game với nhiều phiên bản
- ✅ User chọn phiên bản phù hợp
- ✅ Quản lý tập trung trong 1 game
- ✅ Linh hoạt hơn trong việc cung cấp game

---

**Lưu ý**: Tính năng này là **optional**. Bạn vẫn có thể dùng `GameForm` cũ nếu muốn đơn giản hơn (1 game = 1 phiên bản).
