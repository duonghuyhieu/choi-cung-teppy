# Vercel Deployment Setup

## 🚀 Deploy to Vercel

### Step 1: Import Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from GitHub: `duonghuyhieu/choi-cung-teppy`
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: **Leave empty** (project is at root)

---

### Step 2: Set Environment Variables

**CRITICAL**: Add these environment variables in Vercel dashboard:

| Variable Name | Where to get it |
|--------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API → service_role secret key |
| `JWT_SECRET` | Generate random string (e.g., `openssl rand -base64 32`) |

#### How to add in Vercel:

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable above
4. Apply to: **Production**, **Preview**, and **Development**
5. Click "Save"

---

### Step 3: Redeploy

After adding environment variables:

1. Go to Deployments tab
2. Click on the latest deployment
3. Click "Redeploy" button
4. OR: Push a new commit to trigger automatic redeployment

---

## ✅ Verification

After successful deployment:

1. Visit your app: `https://your-project.vercel.app`
2. Test login at: `https://your-project.vercel.app/admin`
3. Check if CLI can connect:
   ```bash
   npx @duonghuyhieu/game-saver
   ```

---

## 🔧 Supabase Setup (if not done yet)

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for database to be ready (~2 minutes)

### 2. Run Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy content from `supabase-schema.sql`
3. Paste and run

### 3. Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Create new bucket: `save-files`
3. Set to **private** (public = false)

---

## 📝 Current Deployment

- Production URL: https://choi-cung-teppy.vercel.app
- CLI connects to this URL automatically

---

## ⚠️ Troubleshooting

### Build fails with "supabaseUrl is required"

→ Environment variables not set in Vercel. Go to Settings → Environment Variables.

### App deploys but API errors

→ Check Supabase credentials are correct and database schema is installed.

### CLI can't connect

→ Verify API_URL in `cli/config.ts` matches your Vercel deployment URL.

---

**Last updated:** November 5, 2024
