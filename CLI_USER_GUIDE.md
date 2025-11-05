# 🎮 Hướng dẫn sử dụng Game Saver CLI

**Game Saver** là công cụ giúp bạn backup và đồng bộ save game lên cloud, sử dụng ngay trên command line (terminal).

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt](#cài-đặt)
3. [Chạy lần đầu](#chạy-lần-đầu)
4. [Đăng ký tài khoản](#đăng-ký-tài-khoản)
5. [Đăng nhập](#đăng-nhập)
6. [Chọn game](#chọn-game)
7. [Upload save game](#upload-save-game)
8. [Download save game](#download-save-game)
9. [Xem download links](#xem-download-links)
10. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## ⚙️ Yêu cầu hệ thống

- **Windows** (7/8/10/11)
- **Node.js** 16+ ([Tải tại đây](https://nodejs.org/))
  - Kiểm tra: Mở Command Prompt, gõ `node -v`
  - Nếu hiện `v16.x.x` hoặc cao hơn là OK ✅

---

## 📥 Cài đặt

```bash
# Clone repository
git clone https://github.com/duonghuyhieu/choi-cung-teppy.git
cd choi-cung-teppy

# Install dependencies
npm install
```

> **Lưu ý:** Chỉ cần cài đặt một lần, các lần sau chỉ cần chạy `npm run cli`

---

## 🚀 Chạy lần đầu

### Bước 1: Mở Command Prompt / Terminal

**Windows:**
1. Nhấn `Win + R`
2. Gõ `cmd` và Enter
3. Hoặc tìm "Command Prompt" trong Start Menu

### Bước 2: Chạy CLI

```bash
npm run cli
```

### Bước 3: Giao diện CLI sẽ hiện ra

```
 ██████   █████  ███    ███ ███████     ███████  █████  ██    ██ ███████ ██████
██       ██   ██ ████  ████ ██          ██      ██   ██ ██    ██ ██      ██   ██
██   ███ ███████ ██ ████ ██ █████       ███████ ███████ ██    ██ █████   ██████
██    ██ ██   ██ ██  ██  ██ ██               ██ ██   ██  ██  ██  ██      ██   ██
 ██████  ██   ██ ██      ██ ███████     ███████ ██   ██   ████   ███████ ██   ██

Quan ly va dong bo save game tren cloud

```
? Chon hanh dong:
❯ [1] Dang nhap
  [2] Dang ky
  [0] Thoat
```

---

## 📝 Đăng ký tài khoản

### Bước 1: Chọn "Dang ky" trong menu chính

Dùng **mũi tên ↑↓** để di chuyển, nhấn **Enter** để chọn.

### Bước 2: Điền thông tin

```
> DANG KY

? Email: your.email@example.com
? Username: your_username
? Password: ********
```

### Bước 3: Đợi đăng ký

```
⠋ Dang dang ky...
✔ Dang ky thanh cong!
```

**Sau khi đăng ký thành công, bạn sẽ tự động đăng nhập!**

---

## 🔐 Đăng nhập

### Lần đăng nhập đầu tiên:

1. Chọn `[1] Dang nhap`
2. Nhập email
3. Nhập password

```
> DANG NHAP

? Email: your.email@example.com
? Password: ********

⠋ Dang dang nhap...
✔ Dang nhap thanh cong!
```

### Các lần sau:

CLI sẽ **tự động nhớ** phiên đăng nhập của bạn! Chỉ cần chạy lại:

```bash
# Di chuyển vào thư mục (nếu chưa ở trong đó)
cd choi-cung-teppy

# Chạy CLI
npm run cli
```

Sẽ vào thẳng màn hình chọn game, không cần đăng nhập lại.

---

## 🎮 Chọn game

Sau khi đăng nhập, bạn sẽ thấy danh sách games:

```
> DANH SACH GAME
User: your_username (user)

? Chon game:
❯ [1] Elden Ring - Action RPG by FromSoftware
  [2] Cyberpunk 2077 - Open world RPG
  [3] Stardew Valley - Farming simulator
  [0] Dang xuat
```

**Dùng ↑↓ để chọn game**, nhấn **Enter**.

---

## 📤 Upload save game

### Khi nào cần upload?

- Bạn vừa chơi game xong, muốn **backup save lên cloud**
- Muốn **chia sẻ** save của bạn với người khác (nếu admin cho phép)

### Các bước:

1. **Chọn game** từ danh sách
2. Xem thông tin game (save path, download links)
3. Chọn `[1] Quan ly Save Files`
4. Chọn `[1] Upload save tu game`

```
> SAVE MANAGER - ELDEN RING

? Chon hanh dong:
❯ [1] Upload save tu game
  [2] Download va inject: save_slot1.sav
  [0] Quay lai
```

5. Đợi CLI tự động:
   - Tìm file save trong thư mục game
   - Upload lên cloud

```
⠋ Dang upload save file...
⠋ Dang upload len server...
✔ Upload thanh cong!

? Tiep tuc? (Y/n)
```

**Xong!** Save của bạn đã được backup lên cloud ☁️

---

## 📥 Download save game

### Khi nào cần download?

- Bạn chuyển máy tính mới, muốn **lấy save cũ về**
- Muốn thử save **do người khác chia sẻ**
- Bị mất save local, muốn **khôi phục từ cloud**

### Các bước:

1. **Chọn game** từ danh sách
2. Chọn `[1] Quan ly Save Files`
3. Xem danh sách save files:

```
> SAVE MANAGER - ELDEN RING

DANH SACH SAVE FILES:

[1] save_slot1.sav [PUBLIC]
    By: admin | Size: 512.50 KB
    Level 150, all bosses defeated

[2] my_backup_20241105.sav
    By: your_username | Size: 480.25 KB
    My save backup from Nov 5

? Chon hanh dong:
  [1] Upload save tu game
❯ [2] Download va inject: save_slot1.sav
  [3] Download va inject: my_backup_20241105.sav
  [0] Quay lai
```

4. Chọn save muốn download (ví dụ: `[2]`)
5. Đợi CLI tự động:
   - Download save từ cloud
   - Inject (ghi đè) vào thư mục game của bạn

```
⠋ Dang download save file...
⠋ Dang inject vao game...
✔ Save file injected successfully to: C:\Users\...\AppData\...\EldenRing\save_slot1.sav
✔ Download va inject thanh cong!

? Tiep tuc? (Y/n)
```

**Xong!** Bạn có thể mở game và chơi với save vừa download 🎮

---

## 🔗 Xem download links

Admin có thể thêm **link tải game** cho từng game. Bạn có thể xem trước khi upload/download save.

### Cách xem:

1. **Chọn game** từ danh sách
2. Thông tin game sẽ hiện, bao gồm:

```
> ELDEN RING

Action RPG by FromSoftware

Save path: %APPDATA%\EldenRing\*.sav

DOWNLOAD LINKS:
[1] Steam v1.12.2
    https://store.steampowered.com/app/1245620
[2] GOG v1.12.2
    https://www.gog.com/game/elden_ring
[3] Torrent - Full Game + DLC
    magnet:?xt=urn:btih:...

? Chon hanh dong:
❯ [1] Quan ly Save Files
  [0] Quay lai
```

**Copy link** và dán vào browser để tải game!

---

## ❓ Câu hỏi thường gặp

### 1. Làm sao biết save file nằm ở đâu?

Admin đã cấu hình sẵn! CLI tự động tìm theo **save path template**.

Ví dụ:
- Elden Ring: `%APPDATA%\EldenRing\*.sav`
- Stardew Valley: `%APPDATA%\StardewValley\Saves\*\SaveGameInfo`

### 2. CLI không tìm thấy save file?

**Nguyên nhân:**
- Game chưa được admin thêm vào hệ thống
- Save path không đúng
- Bạn chưa chơi game lần nào (chưa có save)

**Giải pháp:**
- Chơi game một lần để tạo save
- Liên hệ admin để cập nhật save path

### 3. Upload bị lỗi "File too large"?

Save file > 50MB. Hiện tại hệ thống chỉ hỗ trợ file < 50MB.

### 4. Download về nhưng game không nhận save?

**Kiểm tra:**
- Save file có đúng version game không?
- Game có đang chạy không? (Tắt game trước khi inject)
- Thử chạy CLI với quyền **Administrator**

### 5. Tôi muốn xóa save đã upload?

Hiện tại chưa hỗ trợ xóa qua CLI. Liên hệ admin hoặc vào web portal để xóa.

### 6. Làm sao đăng xuất?

Trong menu chính, chọn `[0] Dang xuat`

Hoặc xóa file token:
```bash
# Windows
del %USERPROFILE%\.game-saver-token
```

### 7. Tôi muốn upload save nhưng không muốn public?

Mặc định save của bạn là **private** (chỉ bạn thấy). Admin mới có quyền tạo save public.

### 8. CLI chạy chậm?

**Nguyên nhân:**
- Mạng chậm
- File save lớn
- Server đang bận

**Giải pháp:**
- Đợi một chút, CLI sẽ hoàn thành
- Kiểm tra kết nối internet

### 9. Lỗi "Failed to connect to API"?

**Nguyên nhân:**
- Không có internet
- Server đang bảo trì
- API URL không đúng (nếu bạn tự build)

**Giải pháp:**
- Kiểm tra internet
- Thử lại sau vài phút
- Liên hệ admin

### 10. Tôi có thể dùng trên Linux/Mac không?

Hiện tại chỉ hỗ trợ **Windows** vì:
- Save path dùng `%APPDATA%`, `%LOCALAPPDATA%`
- Hầu hết games PC chỉ có trên Windows

---

## 🆘 Hỗ trợ

### Liên hệ Admin:

- **GitHub Issues:** https://github.com/duonghuyhieu/choi-cung-teppy/issues
- **Email:** duonghuyhieu@example.com (thay bằng email thật)

### Báo lỗi:

Khi gặp lỗi, hãy chụp màn hình và gửi kèm:
1. **Lỗi gì?** (ví dụ: "Upload failed")
2. **Game nào?**
3. **Hệ điều hành?** (Windows 10/11)
4. **Node.js version?** (chạy `node -v`)

---

## 🎉 Chúc bạn chơi game vui vẻ!

Đừng quên **backup save thường xuyên** để không bao giờ mất tiến trình! 💾

---

**Version:** 1.0.0
**Last updated:** November 5, 2024
