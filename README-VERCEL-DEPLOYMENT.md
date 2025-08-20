# Vel France - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Repository Setup
```bash
# Clone this restructured version
git clone <your-repo>
cd vel-france-perfume-shop

# Install dependencies
npm install
```

### 2. Environment Variables
Set these in your Vercel dashboard or `.env.local`:

```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
SESSION_SECRET=your-super-secret-key-here

# Email (Optional - for order notifications)
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment (Optional - BOG Payment)
BOG_CLIENT_ID=your-bog-client-id
BOG_CLIENT_SECRET=your-bog-client-secret

# Meta Pixel (already configured)
FACEBOOK_PIXEL_ID=1450972155929953
```

### 3. Database Setup

#### Option A: Neon Database (Recommended)
1. Go to [Neon.dev](https://neon.dev)
2. Create new project
3. Copy the connection string to `DATABASE_URL`

#### Option B: Railway/Supabase/PlanetScale
1. Create PostgreSQL database
2. Copy connection string to `DATABASE_URL`

### 4. Deploy to Vercel

#### Method 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Set environment variables
4. Deploy automatically

#### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
# Follow prompts and set environment variables
```

### 5. Database Migration
After deployment, run:
```bash
# Install Drizzle CLI
npm install -g drizzle-kit

# Push schema to database
npx drizzle-kit push:pg --config=drizzle.config.ts
```

## 📁 New Project Structure

```
vel-france-perfume-shop/
├── api/                    # Serverless API routes
│   ├── auth/
│   │   └── login.js
│   ├── products.js
│   ├── translations.js
│   ├── cart.js
│   ├── orders.js
│   └── user.js
├── src/                    # React frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── main.tsx
├── public/                 # Static assets
│   └── assets/            # Product images
├── lib/                   # Shared types & schemas
│   └── schema.ts
├── vercel.json            # Vercel configuration
├── index.html             # HTML entry point
├── vite.config.vercel.ts  # Vite configuration
├── tailwind.config.ts     # Tailwind CSS config
└── package.json           # Dependencies
```

## 🔧 Key Changes for Vercel

### 1. Serverless API Routes
- Moved Express routes to `/api` folder
- Each file exports a default handler function
- Automatic serverless function deployment

### 2. Static Asset Optimization
- All images moved to `/public/assets`
- Optimized for Vercel's CDN
- Proper caching headers

### 3. Database Connection
- Uses `@neondatabase/serverless` for edge compatibility
- Connection pooling for better performance
- Serverless-optimized queries

### 4. Authentication Simplification
- Removed Replit-specific auth
- Simple admin login system
- Easy to extend with OAuth providers

## 🛠 Local Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Domain & SSL

Vercel automatically provides:
- HTTPS certificate
- Custom domain support
- Global CDN
- Automatic deployments

## 📊 Performance Features

- **Edge Functions**: API routes run at edge locations
- **Image Optimization**: Automatic WebP conversion
- **Static Caching**: Aggressive caching for assets
- **Gzip/Brotli**: Automatic compression

## 🔐 Security

- Environment variables are encrypted
- HTTPS by default
- CORS properly configured
- SQL injection protection with parameterized queries

## 📞 Support

After deployment:
1. Check Vercel deployment logs for any errors
2. Verify database connection in function logs
3. Test all API endpoints
4. Confirm image loading from `/public/assets`

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify `DATABASE_URL` format
   - Check firewall settings
   - Ensure database accepts external connections

2. **Images Not Loading**
   - Verify files are in `/public/assets`
   - Check file permissions
   - Update image URLs in database

3. **API Routes 404**
   - Check `/api` folder structure
   - Verify export default functions
   - Review Vercel build logs

Your luxury perfume e-commerce platform is now ready for Vercel deployment! 🎉