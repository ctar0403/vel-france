# 🚀 Deployment Guide: Vercel + Railway

## Prerequisites
✅ GitHub repository pushed with `/frontend` and `/backend` folders  
✅ Frontend builds successfully (253KB bundle)  
✅ Backend builds successfully (66.5KB)  
✅ Local testing completed  

---

## 🎯 STEP 1: Deploy Backend to Railway

### 1.1 Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose "Deploy from the repo root"

### 1.2 Configure Railway Settings
1. **Root Directory**: Set to `backend`
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Port**: Railway will auto-detect port from `PORT` environment variable

### 1.3 Set Environment Variables
In Railway dashboard → Variables tab, add:

```
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_super_secret_session_key_here
NODE_ENV=production
PORT=3000
ADMIN_EMAIL=admin@example.com
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
BOG_CLIENT_ID=10001216
MERCHANT_ID=00000000981292N
BOG_SECRET_KEY=your_bog_secret_key
```

### 1.4 Deploy & Get URL
1. Click "Deploy"
2. Wait for deployment to complete
3. **Copy your Railway URL** (e.g., `https://your-app-name.railway.app`)
4. Test: `https://your-app-name.railway.app/health`

---

## 🎯 STEP 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account & Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. **Root Directory**: Set to `frontend`

### 2.2 Configure Build Settings
Vercel should auto-detect, but verify:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```
Name: VITE_API_URL
Value: https://your-railway-url.railway.app
```
(Replace with your actual Railway URL from Step 1.4)

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. **Copy your Vercel URL** (e.g., `https://your-app.vercel.app`)

---

## 🎯 STEP 3: Configure CORS for Production

### 3.1 Update Backend CORS
Update `backend/index.ts` to include your Vercel URL:

```typescript
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Local testing
  'https://your-app.vercel.app', // Replace with actual Vercel URL
  process.env.FRONTEND_URL // Environment variable for production
];
```

### 3.2 Set Railway Environment Variable
In Railway → Variables, add:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 3.3 Redeploy Backend
Railway will auto-redeploy when you push CORS changes to GitHub.

---

## 🎯 STEP 4: Test Production Deployment

### 4.1 Backend Health Check
```bash
curl https://your-railway-url.railway.app/health
curl https://your-railway-url.railway.app/api/products
```

### 4.2 Frontend Test
1. Open `https://your-app.vercel.app`
2. Check browser console for errors
3. Verify products load from Railway backend
4. Test cart functionality
5. Verify all pages work

---

## 🔧 Troubleshooting

### CORS Issues
If you see CORS errors:
1. Verify `FRONTEND_URL` is set in Railway
2. Check `allowedOrigins` includes your Vercel URL
3. Redeploy backend after changes

### Environment Variables
If API calls fail:
1. Verify `VITE_API_URL` in Vercel points to Railway
2. Check all Railway environment variables are set
3. Restart both deployments

### Build Issues
Frontend build fails:
```bash
cd frontend && npm run build
```
Check for TypeScript errors locally first.

Backend build fails:
```bash
cd backend && npm run build
```
Verify all dependencies are in `package.json`.

---

## 📋 Final Checklist

### Railway (Backend)
- [ ] Health endpoint working: `/health`
- [ ] API endpoints working: `/api/products`
- [ ] All environment variables set
- [ ] CORS configured for Vercel URL

### Vercel (Frontend)
- [ ] Site loads without errors
- [ ] `VITE_API_URL` points to Railway
- [ ] Products load from backend
- [ ] All pages accessible
- [ ] Cart/checkout functional

### Production Ready
- [ ] Both deployments successful
- [ ] API communication working
- [ ] All features functional
- [ ] Performance optimized

---

## 🎉 Success!

Your Vel France luxury perfume e-commerce platform is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-railway-url.railway.app

The application maintains all functionality while being hosted on separate platforms for optimal performance and scalability.