# Hướng dẫn Deploy nhanh

## Checklist Deploy

### ☐ 1. Supabase Setup (5 phút)
1. Tạo account tại https://supabase.com
2. New Project → Lưu credentials:
   - URL: `https://xxxxx.supabase.co`
   - `anon key`
   - `service_role key`
3. SQL Editor → Copy/paste file `supabase-schema.sql` → Run
4. Storage → New bucket: `save-files` (public = false)

### ☐ 2. Push code lên GitHub (2 phút)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/game-saver.git
git push -u origin main
```

### ☐ 3. Deploy Web lên Vercel (3 phút)
1. https://vercel.com → Import GitHub repo
2. Settings:
   - **Root Directory**: `web`
   - Framework: Next.js (auto detect)
3. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   JWT_SECRET=random-string-here-change-me
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
4. Deploy → Đợi build (~2 phút)
5. Lưu URL: `https://your-app.vercel.app`

### ☐ 4. Tạo Admin User (1 phút)
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "username": "admin",
    "password": "ChangeMe123!",
    "role": "admin"
  }'
```

### ☐ 5. Publish Desktop App lên NPM (5 phút)

#### Option A: NPM Package (Khuyên dùng)
1. Đăng ký NPM: https://www.npmjs.com/signup
2. Update `desktop/package.json`:
   ```json
   {
     "name": "@your-username/game-saver",
     "version": "1.0.0"
   }
   ```
3. Hardcode API URL trong `desktop/src/config.ts`:
   ```typescript
   export const API_URL = 'https://your-app.vercel.app';
   ```
4. Build và publish:
   ```bash
   cd desktop
   npm login
   npm run build
   npm publish --access public
   ```
5. Test:
   ```bash
   npx @your-username/game-saver
   ```

#### Option B: Build .exe (Alternative)
```bash
cd desktop
npm run electron:build
# File .exe trong folder release/
# Upload lên GitHub Releases
```

---

## Post-Deploy

### Test Web App
1. Vào https://your-app.vercel.app
2. Login bằng admin account
3. Thêm 1 game test:
   - Name: "Test Game"
   - Save path: `%APPDATA%/TestGame/*.sav`
4. Thêm download link
5. Upload 1 save file public

### Test Desktop App
1. Chạy: `npx @your-username/game-saver`
2. Register user mới
3. Login
4. Xem game list
5. Test download save

---

## Update sau này

### Update Web App
```bash
# Push changes
git add .
git commit -m "Update features"
git push

# Vercel tự động deploy lại
```

### Update Desktop App
```bash
cd desktop

# Bump version trong package.json
# "version": "1.0.1"

npm run build
npm publish

# User chỉ cần chạy lại NPX, sẽ tự động dùng version mới
```

---

## Monitoring & Logs

### Vercel Logs
- Dashboard → Project → Logs
- Xem API errors, performance

### Supabase Logs
- Dashboard → Logs
- Xem database queries, errors

### Desktop App Logs
- Mở DevTools: Ctrl+Shift+I (nếu dev mode)
- Production: Console.log sẽ không hiện

---

## Cost Estimate (Free Tier)

- **Supabase**: 500MB DB + 1GB Storage + 2GB Bandwidth → FREE
- **Vercel**: 100GB Bandwidth → FREE
- **NPM**: Unlimited downloads → FREE

**Tổng: $0/tháng** (với ~100 users, 100 games, 500KB/save)

Nếu vượt quota:
- Supabase Pro: $25/month (8GB DB, 100GB Storage)
- Vercel Pro: $20/month (1TB Bandwidth)
