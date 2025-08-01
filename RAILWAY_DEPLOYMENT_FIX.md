# 🚨 Railway Deployment Fix

## Issue
Railway can't find the DATABASE_URL environment variable.

## ✅ Solution: Complete Railway Setup

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **IMPORTANT**: Set "Root Directory" to `backend` (not repo root)

### Step 2: Configure Build Settings
In Railway project settings:
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Step 3: Add ALL Environment Variables
In Railway Dashboard → Variables tab, add these EXACT variables:

```
DATABASE_URL
postgresql://neondb_owner:npg_LDQdZpRo02wT@ep-small-glitter-adj30x5f.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

SESSION_SECRET
a8b9c2d4e6f8a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8

NODE_ENV
production

PORT
3000

BOG_CLIENT_ID
10001216

MERCHANT_ID
00000000981292N

ADMIN_EMAIL
admin@velfrance.com

EMAIL_USER
your_gmail@gmail.com

EMAIL_APP_PASSWORD
your_gmail_app_password

BOG_SECRET_KEY
your_bog_production_secret_key
```

### Step 4: Deploy
1. Click "Deploy" button
2. Monitor build logs for any errors
3. Once deployed, you'll get a Railway URL like: `https://your-app-name.railway.app`

### Step 5: Test Deployment
```bash
curl https://your-railway-url.railway.app/health
curl https://your-railway-url.railway.app/api/products
```

## 🔍 Common Issues

### Environment Variables Not Found
- Make sure you set "Root Directory" to `backend`
- Verify all variables are added in Railway dashboard
- Check variable names match exactly (case-sensitive)

### Build Fails
- Ensure `backend/package.json` has correct scripts
- Check build logs for missing dependencies

### Database Connection Fails
- Verify DATABASE_URL is exactly as provided
- Check database is accessible from Railway's IP ranges
- Ensure SSL mode is included in connection string

## ✅ Success Indicators
- Health endpoint returns 200 OK
- API endpoints return product data
- No environment variable errors in logs
- Railway deployment shows "Active" status