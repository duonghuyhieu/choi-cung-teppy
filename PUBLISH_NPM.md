# 📦 Hướng dẫn Publish CLI lên NPM

Để người dùng có thể chạy `npx @duonghuyhieu/game-saver` mà không cần clone git.

---

## ✅ Prerequisites đã hoàn thành

- [x] Package.json đã được cấu hình với tên `@duonghuyhieu/game-saver`
- [x] Package không còn private (`"private": false`)
- [x] Đã có bin entry point tại `./bin/cli.js`

---

## 📋 Các bước cần làm

### Bước 1: Deploy Web App lên Production

**CLI cần kết nối tới API backend, vì vậy bạn phải deploy web app trước!**

#### Deploy lên Vercel:

```bash
# Đảm bảo code đã push lên GitHub
git push

# Truy cập https://vercel.com
# 1. Import repository: duonghuyhieu/choi-cung-teppy
# 2. Root Directory: để trống (project đã ở root)
# 3. Add Environment Variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - JWT_SECRET
# 4. Click Deploy
```

Sau khi deploy xong, bạn sẽ có URL dạng: `https://your-app.vercel.app`

---

### Bước 2: Update Production API URL

Mở file `cli/config.ts` và hardcode production URL:

```typescript
// cli/config.ts

// Thay thế dòng này:
export const API_URL = process.env.API_URL || 'http://localhost:3000';

// Bằng URL production của bạn:
export const API_URL = 'https://your-app.vercel.app';
```

**Lưu ý:** Sau khi publish NPM, người dùng sẽ connect tới URL này. Đảm bảo web app đang chạy ổn định!

---

### Bước 3: Test CLI Local

Trước khi publish, test CLI để đảm bảo nó hoạt động:

```bash
# Chạy CLI local
npm run cli

# Test các chức năng:
# 1. Đăng ký tài khoản
# 2. Đăng nhập
# 3. Xem danh sách games
# 4. Upload save
# 5. Download save
```

---

### Bước 4: Build CLI

```bash
npm run build:cli
```

Kiểm tra folder `dist/` đã được tạo ra.

---

### Bước 5: Login vào NPM

```bash
# Login vào NPM account
npm login

# Nhập:
# - Username: duonghuyhieu
# - Password: ********
# - Email: your-email@example.com
```

**Lưu ý:** Nếu chưa có NPM account, đăng ký tại: https://www.npmjs.com/signup

---

### Bước 6: Publish lên NPM

```bash
# Publish package
npm publish --access public

# Output:
# + @duonghuyhieu/game-saver@1.0.0
```

✅ **Done!** Package đã được publish lên NPM.

---

## 🎉 Người dùng giờ có thể chạy:

```bash
npx @duonghuyhieu/game-saver
```

**Không cần clone git, không cần cài đặt!**

---

## 🔄 Update Version Mới

Khi có thay đổi code, cập nhật version và publish lại:

```bash
# 1. Update version trong package.json
# "version": "1.0.1" (hoặc "1.1.0", "2.0.0")

# 2. Build lại
npm run build:cli

# 3. Publish
npm publish --access public
```

---

## ⚠️ Lưu ý quan trọng

### 1. API URL phải là Production

Người dùng sẽ connect tới `API_URL` được hardcode trong `cli/config.ts`.

❌ **KHÔNG publish với localhost:**
```typescript
export const API_URL = 'http://localhost:3000'; // SAI!
```

✅ **Phải là production URL:**
```typescript
export const API_URL = 'https://your-app.vercel.app'; // ĐÚNG!
```

### 2. Web App phải Online 24/7

CLI cần API backend để hoạt động. Nếu web app die, CLI cũng không hoạt động.

Vercel Free Tier đã đủ cho 24/7 uptime!

### 3. Test trước khi Publish

Luôn test CLI trên máy local trước khi publish:
```bash
npm run cli
```

### 4. Semantic Versioning

- **Patch** (1.0.x): Bug fixes, không có breaking changes
- **Minor** (1.x.0): New features, không có breaking changes
- **Major** (x.0.0): Breaking changes

---

## 🆘 Troubleshooting

### Lỗi: "You do not have permission to publish"

```bash
# Đảm bảo đã login
npm whoami

# Nếu chưa login:
npm login
```

### Lỗi: "Package name already exists"

Package name `@duonghuyhieu/game-saver` đã tồn tại trên NPM (của người khác).

Giải pháp: Đổi tên trong `package.json`:
```json
{
  "name": "@duonghuyhieu/game-saver-cli"
}
```

### Lỗi: "Cannot find module './cli/index.js'"

```bash
# Build lại CLI
npm run build:cli

# Kiểm tra file dist/ đã tạo chưa
ls dist/
```

---

## 📚 Tham khảo

- [NPM Publish Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Vercel Deployment](https://vercel.com/docs)
- [Semantic Versioning](https://semver.org/)

---

**Version:** 1.0.0
