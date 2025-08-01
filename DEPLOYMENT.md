# Deployment Guide - Vel France E-commerce Platform

## Project Structure

The project has been restructured for separate hosting:

```
├── frontend/          # Vite + React frontend (deploy to Vercel)
├── backend/           # Express + TypeScript API (deploy to Railway)
├── shared/           # Shared TypeScript schemas and types
└── attached_assets/  # Image assets
```

## Frontend Deployment (Vercel)

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed: `npm i -g vercel`

### Steps
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Update `vercel.json` with your backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-backend-url.up.railway.app/api/$1" }
     ]
   }
   ```
4. Build for production: `npm run build`
5. Deploy to Vercel: `vercel --prod`

### Environment Variables (Vercel)
Set these in your Vercel dashboard:
- None required for frontend (API calls proxied to backend)

## Backend Deployment (Railway)

### Prerequisites
- Railway CLI installed: `npm install -g @railway/cli`
- Railway account created

### Steps
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create Railway project: `railway login && railway new`
4. Deploy: `railway up`

### Environment Variables (Railway)
Set these in your Railway dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_EMAIL` - Admin email for notifications
- `EMAIL_USER` - SMTP email username
- `EMAIL_APP_PASSWORD` - SMTP email password
- `BOG_CLIENT_ID` - BOG Payment gateway client ID
- `BOG_SECRET_KEY` - BOG Payment gateway secret key
- `NODE_ENV=production`

### Database Setup
1. Add PostgreSQL addon in Railway dashboard
2. Copy the `DATABASE_URL` to environment variables
3. Run migrations: `npm run db:push`

## Local Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### Backend Development
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:3000

### Full Stack Development
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Frontend will proxy API calls to backend

## Health Checks

### Backend Health Check
- URL: `https://your-backend-url.up.railway.app/health`
- Expected response: `OK`

### Frontend Health Check
- URL: `https://your-frontend-url.vercel.app`
- Expected: Full website loads correctly

## Production Build Commands

### Frontend
```bash
npm run build    # Build for production
npm run start    # Preview production build
```

### Backend
```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
```

## Post-Deployment Steps

1. **Update Frontend API URL**: Update `vercel.json` with actual Railway backend URL
2. **Test Payment Integration**: Verify BOG payment gateway works with production URLs
3. **Email Configuration**: Test order confirmation emails
4. **Performance Monitoring**: Check Google Lighthouse scores
5. **SSL Certificate**: Ensure both frontend and backend have HTTPS enabled

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend allows frontend domain in CORS settings
2. **API Not Found**: Check `vercel.json` proxy configuration
3. **Database Connection**: Verify `DATABASE_URL` in Railway environment
4. **Image Loading**: Ensure asset paths are correct in production

### Monitoring
- Railway provides logs and metrics for backend
- Vercel provides analytics and performance insights for frontend
- Use browser DevTools to debug API calls and performance