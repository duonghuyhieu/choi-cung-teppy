# Game Saver

Hệ thống quản lý và đồng bộ save game trên cloud. Gồm web app (admin portal) và **CLI tool** chạy trực tiếp trong terminal.

## Tính năng

- 💾 **Backup save game** lên cloud (Supabase Storage)
- 🔄 **Đồng bộ** save game giữa nhiều thiết bị
- 📥 **Download save public** do admin chia sẻ
- ⚡ **Tự động inject** save vào thư mục game
- 🎮 **Quản lý games** và download links (admin)
- 🖥️ **CLI thuần túy** - chạy ngay trong terminal, không cần mở app riêng

## Kiến trúc

```
web/
├── app/          # Next.js Web App (Admin + User Portal)
├── cli/          # Node.js CLI Tool
│   ├── index.ts          # CLI entry point
│   ├── config.ts         # API configuration
│   └── services/         # API client & file system
├── types/        # Shared TypeScript types
├── bin/          # CLI executable
└── components/   # React components
```

## Tech Stack

- **Web**: Next.js 14, React, Supabase, Tailwind CSS
- **CLI**: Node.js, Inquirer, Chalk, Ora
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deploy**: Vercel (web), NPM (CLI)

---

## 📚 Hướng dẫn sử dụng

### 👥 Cho người dùng (End Users):

- **[⚡ Quick Start Guide](./QUICK_START_USER.md)** - Bắt đầu trong 5 phút!
- **[📖 Hướng dẫn đầy đủ](./CLI_USER_GUIDE.md)** - Hướng dẫn chi tiết từng bước

### 👨‍💻 Cho Developers:

Đọc tiếp phần [Setup cho Developers](#setup-cho-developers) bên dưới.

---

## Cài đặt và Sử dụng

### User: Chạy CLI ngay

```bash
npx @duonghuyhieu/game-saver
```

**Giao diện CLI sẽ hiện ngay trong terminal của bạn!**

```
 ██████   █████  ███    ███ ███████     ███████  █████  ██    ██ ███████ ██████
██       ██   ██ ████  ████ ██          ██      ██   ██ ██    ██ ██      ██   ██
██   ███ ███████ ██ ████ ██ █████       ███████ ███████ ██    ██ █████   ██████
██    ██ ██   ██ ██  ██  ██ ██               ██ ██   ██  ██  ██  ██      ██   ██
 ██████  ██   ██ ██      ██ ███████     ███████ ██   ██   ████   ███████ ██   ██

Quan ly va dong bo save game tren cloud

? Chon hanh dong: (Use arrow keys)
❯ [1] Dang nhap
  [2] Dang ky
  [0] Thoat
```

---

## Setup cho Developers

### 1. Supabase Setup

#### a. Tạo Supabase Project
1. Đăng ký tại https://supabase.com
2. Tạo project mới
3. Lưu lại:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### b. Chạy Database Schema
1. Mở **SQL Editor** trong Supabase Dashboard
2. Copy nội dung file `supabase-schema.sql`
3. Paste và chạy

#### c. Tạo Storage Bucket
1. Vào **Storage** trong Supabase Dashboard
2. Tạo bucket mới tên: `save-files`
3. Để public = false

---

### 2. Web App Setup (Local Development)

```bash
# Clone repository
git clone https://github.com/duonghuyhieu/choi-cung-teppy.git
cd choi-cung-teppy

# Copy environment file
cp .env.example .env.local

# Chỉnh sửa .env.local với Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
# JWT_SECRET=your-random-secret-key

# Install dependencies
npm install

# Run development server
npm run dev
```

Web app chạy tại: http://localhost:3000

---

### 3. Deploy Web App lên Vercel

```bash
# Push to GitHub (đã có git trong web/)
git push

# Vercel Dashboard:
# 1. Import repository từ GitHub
# 2. Không cần set Root Directory (project đã ở root)
# 3. Add Environment Variables (same as .env.local)
# 4. Deploy!
```

Tạo Admin User:
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "username": "admin",
    "password": "your-secure-password",
    "role": "admin"
  }'
```

---

### 4. CLI Tool Setup

#### Development (Local)

```bash
# Tạo file .env trong cli/
echo "API_URL=http://localhost:3000" > cli/.env
# Hoặc production:
# echo "API_URL=https://your-app.vercel.app" > cli/.env

# Run CLI
npm run cli
```

#### Production: Publish lên NPM

1. **Update package.json**:
   ```json
   {
     "name": "@your-username/game-saver",
     "version": "1.0.0",
     "private": false
   }
   ```

2. **Hardcode API URL** trong `cli/config.ts`:
   ```typescript
   export const API_URL = 'https://your-app.vercel.app';
   ```

3. **Build CLI**:
   ```bash
   npm run build:cli
   ```

4. **Publish**:
   ```bash
   npm login
   npm publish --access public
   ```

5. **User chạy**:
   ```bash
   npx @your-username/game-saver
   ```

---

## Sử dụng

### Web App (Admin)

1. Login vào https://your-app.vercel.app
2. Thêm games:
   - Tên game
   - **Save path template**: `%APPDATA%/GameName/saves/*.sav`
   - Download links
3. Upload public save files (optional)

### CLI Tool (User)

1. **Chạy**: `npx game-saver` (hoặc `npx @your-username/game-saver`)
2. **Đăng ký/Đăng nhập**
3. **Chọn game** từ danh sách
4. **Xem download links** để tải game
5. **Quản lý save**:
   - **Upload**: Tự động extract từ game folder → upload cloud
   - **Download**: Tự động download → inject vào game folder

---

## Path Template Examples

```
Windows Game Pass:
%LOCALAPPDATA%/Packages/Microsoft.*/LocalState/*.sav

Steam:
%USERPROFILE%/Documents/My Games/GameName/*.sav

Epic:
%LOCALAPPDATA%/EpicGamesLauncher/Saved/SaveGames/*.sav

Custom:
%APPDATA%/GameName/saves/slot*.dat
```

Hỗ trợ wildcards `*` - sẽ match file đầu tiên tìm thấy.

---

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Games
```
GET    /api/games
POST   /api/games            (admin only)
GET    /api/games/:id
PUT    /api/games/:id        (admin only)
DELETE /api/games/:id        (admin only)
```

### Save Files
```
GET    /api/games/:id/saves
POST   /api/games/:id/saves
GET    /api/saves/:id
PUT    /api/saves/:id
DELETE /api/saves/:id
```

---

## Features

### CLI Features
✅ **Interactive menu** - dùng arrow keys để navigate
✅ **Persistent authentication** - token lưu trong `~/.game-saver-token`
✅ **Colored output** - dễ đọc với chalk
✅ **Loading spinners** - feedback khi đang xử lý
✅ **Auto path resolution** - tự động tìm file theo template
✅ **Error handling** - thông báo lỗi rõ ràng

### Web Features
✅ **JWT authentication**
✅ **Admin role management**
✅ **File upload/download**
✅ **Row Level Security (RLS)**

---

## Bảo mật

- ✅ JWT authentication
- ✅ HTTP-only cookies
- ✅ Supabase RLS
- ✅ Admin role-based access
- ✅ Presigned URLs cho downloads
- ✅ Token stored locally (~/.game-saver-token)

---

## Troubleshooting

### CLI không connect được API
```bash
# Check API_URL
cat cli/.env

# hoặc hardcode trong cli/config.ts
```

### Save file không inject được
- Kiểm tra path template có đúng không
- Chạy CLI với quyền Administrator (nếu cần write vào Program Files)

### Upload save lỗi
- Kiểm tra file tồn tại: path template có resolve được không
- Check file size < 50MB

---

## Requirements

- **Node.js**: 16+ (để chạy CLI)
- **NPM**: 8+ (để chạy NPX)
- **OS**: Windows (vì dùng %APPDATA% paths)

---

## Cost (Free Tier)

- Supabase: 500MB DB + 1GB Storage → **$0**
- Vercel: 100GB Bandwidth → **$0**
- NPM: Unlimited downloads → **$0**

**Total: $0/month** ✅

---

## License

MIT
