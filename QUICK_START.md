# Quick Start Guide

## Cài đặt nhanh (10 phút)

### 1. Supabase (3 phút)
```
1. supabase.com → New Project
2. Copy: URL, anon_key, service_role_key
3. SQL Editor → Paste supabase-schema.sql → Run
4. Storage → New bucket: "save-files"
```

### 2. Deploy Web (3 phút)
```bash
# Push to GitHub
git init && git add . && git commit -m "init" && git push

# Vercel: Import repo → Root: "web"
# Add env vars → Deploy
```

### 3. Tạo Admin (1 phút)
```bash
curl -X POST https://YOUR-APP.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","username":"admin","password":"admin123","role":"admin"}'
```

### 4. Desktop App (3 phút)
```bash
cd desktop
# Edit src/config.ts → API_URL = "https://YOUR-APP.vercel.app"
npm install
npm run build
npm publish  # or build .exe
```

## Sử dụng

### Admin (Web)
```
1. Login → Add game
2. Game name: "GTA V"
3. Save path: %APPDATA%/GTAV/saves/*.sav
4. Add download link
5. Upload public save (optional)
```

### User (Desktop)
```bash
npx game-saver

# Menu:
# [1] Login/Register
# [2] Chọn game
# [3] Download save → Auto inject
# [4] Upload save → Auto extract
```

## Path Templates

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

## Troubleshooting

**Desktop không connect:**
```bash
# Check API_URL trong desktop/src/config.ts
# Phải là: https://your-app.vercel.app
```

**Save không inject:**
```bash
# Test path:
node
> process.env.APPDATA
# "C:\\Users\\YourName\\AppData\\Roaming"

# Check folder tồn tại chưa
```

**Upload lỗi:**
```bash
# Check file exists:
# Desktop → F12 (DevTools) → Console
```

## Support

- Issues: GitHub Issues
- Docs: README.md
- Deploy: DEPLOYMENT.md
