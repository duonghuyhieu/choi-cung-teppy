# ⚡ Quick Start - Game Saver CLI

Hướng dẫn nhanh 5 phút để bắt đầu backup và đồng bộ save game!

---

## 📋 Yêu cầu

- ✅ Windows (7/8/10/11)
- ✅ Node.js 16+ ([Tải tại đây](https://nodejs.org/))

Kiểm tra Node.js đã cài chưa:
```bash
node -v
# Phải hiện v16.x.x trở lên
```

---

## 🚀 Bước 1: Chạy Game Saver

Mở **Command Prompt** (Win + R → gõ `cmd`) và chạy:

```bash
npx @duonghuyhieu/game-saver
```

> Lần đầu sẽ tải về ~5MB, các lần sau chạy ngay!

Bạn sẽ thấy menu chọn chế độ:

```
? Chon che do:
❯ [1] 🖥️  Giao dien (GUI) - De dung, thich hop cho nguoi moi
  [2] ⚡ CLI - Nhanh gon cho nguoi co kinh nghiem
  [0] 🚪 Thoat
```

**Chọn [1] Giao diện (GUI)** - Giao diện đồ họa trong browser, dễ sử dụng!
**Hoặc [2] CLI** - Nhanh gọn, chạy trực tiếp trên terminal.

---

## 🖥️ Option 1: Giao diện (GUI) - Dễ dùng

**Ưu điểm:**
- ✅ Giao diện đồ họa đẹp mắt, dễ nhìn
- ✅ Click chuột thay vì gõ lệnh
- ✅ Phù hợp cho người mới bắt đầu
- ✅ Có đầy đủ tính năng (kể cả admin)

**Khi chọn Giao diện:**
1. Server tự động khởi động tại `http://localhost:3000`
2. Browser tự động mở
3. Sử dụng như một website bình thường

**Lưu ý:** Chế độ Giao diện chỉ hoạt động khi bạn **clone repository về máy**:
```bash
git clone https://github.com/duonghuyhieu/choi-cung-teppy.git
cd choi-cung-teppy
npm install
npm run cli
# Chọn [1] Giao diện
```

---

## ⚡ Option 2: CLI - Nhanh gọn

**Ưu điểm:**
- ⚡ Nhanh, nhẹ, chạy ngay
- ⚡ Không cần clone repo
- ⚡ Phù hợp cho power users
- ⚡ Chạy mọi nơi có Node.js

**Khi chọn CLI**, tiếp tục với các bước sau:

---

## 👤 Bước 2: Đăng ký/Đăng nhập (CLI Mode)

### Đăng ký lần đầu:
```
? Chon hanh dong:
❯ [2] Dang ky

? Email: yourname@example.com
? Username: yourname
? Password: ********

✔ Dang ky thanh cong!
```

### Lần sau:
CLI tự động nhớ đăng nhập, không cần nhập lại! 🎉

---

## 🎮 Bước 3: Chọn game

```
> DANH SACH GAME

? Chon game:
❯ [1] Elden Ring
  [2] Cyberpunk 2077
  [3] Stardew Valley
```

Dùng **↑↓** để chọn, nhấn **Enter**.

---

## 💾 Bước 4: Upload save (Backup lên cloud)

```
? Chon hanh dong:
❯ [1] Upload save tu game

⠋ Dang upload save file...
✔ Upload thanh cong!
```

**CLI tự động:**
1. ✅ Tìm file save trong thư mục game
2. ✅ Upload lên cloud

---

## 📥 Bước 5: Download save (Khôi phục về máy)

```
DANH SACH SAVE FILES:

[1] save_slot1.sav [PUBLIC]
    By: admin | Size: 512 KB
    Level 150, all bosses

[2] my_backup_yesterday.sav
    By: yourname | Size: 480 KB

? Chon hanh dong:
❯ [2] Download va inject: save_slot1.sav

⠋ Dang download save file...
✔ Download va inject thanh cong!
```

**CLI tự động:**
1. ✅ Download từ cloud
2. ✅ Inject (ghi đè) vào thư mục game

**Xong!** Mở game là chơi được ngay 🎮

---

## 🔗 Bonus: Xem link tải game

Khi chọn game, CLI sẽ hiện download links:

```
> ELDEN RING

DOWNLOAD LINKS:
[1] Steam v1.12.2
    https://store.steampowered.com/...
[2] GOG v1.12.2
    https://www.gog.com/...
[3] Torrent - Full Game
    magnet:?xt=urn:btih:...
```

Copy link → Paste vào browser → Tải game! 🎯

---

## ❓ Câu hỏi nhanh

### ❌ "Cannot find save file"?
- Chơi game một lần để tạo save
- Hoặc game chưa được admin thêm

### ❌ "Upload failed"?
- Kiểm tra internet
- File save có thể quá lớn (>50MB)

### ❌ "Download về nhưng game không nhận"?
- Tắt game trước khi download
- Chạy CLI với quyền Administrator

### 📧 Cần hỗ trợ?
- [GitHub Issues](https://github.com/duonghuyhieu/choi-cung-teppy/issues)
- [Hướng dẫn đầy đủ](./CLI_USER_GUIDE.md)

---

## 📚 Đọc thêm

Muốn tìm hiểu kỹ hơn? Đọc **[Hướng dẫn đầy đủ](./CLI_USER_GUIDE.md)**:
- Cách upload save private/public
- Xóa save đã upload
- Troubleshooting chi tiết
- FAQs

---

**🎮 Chúc bạn chơi game vui vẻ và không bao giờ mất save!**

```
 ██████   █████  ███    ███ ███████     ███████  █████  ██    ██ ███████ ██████
██       ██   ██ ████  ████ ██          ██      ██   ██ ██    ██ ██      ██   ██
██   ███ ███████ ██ ████ ██ █████       ███████ ███████ ██    ██ █████   ██████
██    ██ ██   ██ ██  ██  ██ ██               ██ ██   ██  ██  ██  ██      ██   ██
 ██████  ██   ██ ██      ██ ███████     ███████ ██   ██   ████   ███████ ██   ██
```

---

**Version:** 1.0.0
**Repository:** https://github.com/duonghuyhieu/choi-cung-teppy
