# Local Development Testing Guide

## ✅ BACKEND SETUP (Port 5000)

### 1. Install Dependencies & Build
```bash
cd backend
npm install
npm run build
```

### 2. Environment Setup
Copy `.env` file with required variables:
```
DATABASE_URL=postgresql://neondb_owner:your_password@your_host/neondb
SESSION_SECRET=your_super_secret_session_key_here
NODE_ENV=development
PORT=3000
ADMIN_EMAIL=admin@example.com
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
BOG_CLIENT_ID=10001216
MERCHANT_ID=00000000981292N
BOG_SECRET_KEY=your_bog_secret_key
```

### 3. Start Backend
```bash
npm start
# or for development:
npm run dev
```

**Health Check**: http://localhost:5000/health (returns HTML page)  
**API Test**: http://localhost:5000/api/products (returns JSON product array)

---

## ✅ FRONTEND SETUP (Port 5173)

### 1. Install Dependencies & Build Test
```bash
cd frontend
npm install
npm run build
```
**Expected**: `dist/` folder with 253KB main bundle + PWA files

### 2. Environment Setup
`.env` file:
```
VITE_API_URL=http://localhost:5000
```

### 3. Start Frontend Development
```bash
npm run dev
```
**URL**: http://localhost:5173

---

## ✅ FULL LOCAL TEST

### Terminal 1: Backend
```bash
cd backend && npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend && npm run dev
```

### Verify
1. **Frontend loads**: http://localhost:5173
2. **Backend responds**: http://localhost:5000/health
3. **API integration**: Frontend should load products from backend
4. **CORS enabled**: No CORS errors in browser console

---

## ✅ PRODUCTION BUILD TEST

### Frontend Production Build
```bash
cd frontend
npm run build
npm run preview
```

### Backend Production Build
```bash
cd backend
npm run build
PORT=3000 npm start
```

---

## 🚀 DEPLOYMENT READY

Both environments are now ready for:
- **Frontend → Vercel**: `frontend/` folder
- **Backend → Railway**: `backend/` folder

See `DEPLOYMENT.md` for complete deployment instructions.