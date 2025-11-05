# ✅ Pre-Deploy Checklist

## Files cần EDIT trước khi deploy

### 1. `desktop/src/config.ts` ⚠️ QUAN TRỌNG
```typescript
// BEFORE (development):
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// AFTER (production):
export const API_URL = 'https://YOUR-APP.vercel.app';  // Hardcode production URL
```

### 2. `desktop/package.json` ⚠️ QUAN TRỌNG
```json
{
  "name": "game-saver",  // ❌ Change this!
  "version": "1.0.0"
}

// TO:
{
  "name": "@your-npm-username/game-saver",  // ✅ Your NPM username
  "version": "1.0.0"
}
```

### 3. `web/.env.local` (Local development only)
```bash
# Tạo file này từ .env.example
cp web/.env.example web/.env.local

# Edit với Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
JWT_SECRET=random-string-here
```

### 4. `desktop/.env` (Local development only)
```bash
# Tạo file này từ .env.example
cp desktop/.env.example desktop/.env

# For local dev:
VITE_API_URL=http://localhost:3000

# For testing production:
# VITE_API_URL=https://your-app.vercel.app
```

---

## Vercel Environment Variables

Khi deploy lên Vercel, add các biến này trong Dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
JWT_SECRET=random-string-here-change-me
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Files KHÔNG cần edit

✅ Các file sau đã sẵn sàng, không cần sửa:
- `supabase-schema.sql`
- `web/app/**/*`
- `web/lib/**/*`
- `desktop/src/App.tsx`
- `desktop/src/services/**/*`
- `desktop/electron/**/*`

---

## Deployment Order

```
1. Supabase Setup
   ↓
2. Push to GitHub
   ↓
3. Deploy Web (Vercel)
   ↓
4. Create Admin User (API call)
   ↓
5. Edit desktop/src/config.ts
   ↓
6. Edit desktop/package.json
   ↓
7. Publish Desktop (NPM)
   ↓
8. Test!
```

---

## Testing Checklist

### Web App
- [ ] Landing page hiển thị đúng
- [ ] `/api/games` trả về empty array
- [ ] Register admin user thành công
- [ ] Login admin thành công
- [ ] Create game thành công
- [ ] Upload save file thành công

### Desktop App
- [ ] `npx @your-username/game-saver` chạy được
- [ ] Terminal UI hiển thị đúng
- [ ] Login thành công
- [ ] Game list hiển thị
- [ ] Download save thành công
- [ ] Upload save thành công (nếu có game folder)

---

## Security Check

- [ ] `.env.local` trong `.gitignore`
- [ ] Không commit Supabase keys vào GitHub
- [ ] JWT_SECRET là random string (không dùng default)
- [ ] Admin password strong (khi tạo qua API)
- [ ] RLS policies đã enable trong Supabase

---

## Quick Deploy Commands

```bash
# 1. Install dependencies
npm run install:all

# 2. Test web locally
cd web && npm run dev

# 3. Test desktop locally
cd desktop && npm run dev

# 4. Push to GitHub
git add .
git commit -m "Ready for production"
git push

# 5. Deploy web: Vercel auto-deploys

# 6. Publish desktop
cd desktop
npm login
npm publish --access public
```

---

## Rollback Plan

Nếu có lỗi sau deploy:

### Web App
```bash
# Vercel → Deployments → Rollback to previous
```

### Desktop App
```bash
# NPM không thể unpublish sau 24h
# Phải publish version mới
npm version patch  # 1.0.0 → 1.0.1
npm publish
```

---

## Support Contacts

- **Supabase Issues**: https://supabase.com/docs
- **Vercel Issues**: https://vercel.com/docs
- **NPM Issues**: https://docs.npmjs.com
