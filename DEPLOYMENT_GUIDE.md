# 🚀 VelFranceLux Deployment Guide

## Quick Start - Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Domain name (optional, Vercel provides free subdomain)
- Environment variables ready

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/VelFranceLux.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" and import your repository
3. Vercel will auto-detect your framework settings
4. Add environment variables in the dashboard
5. Deploy!

### 3. Environment Variables Setup
Add these in Vercel dashboard under Settings > Environment Variables:
```
DATABASE_URL=your_neon_or_planetscale_url
SESSION_SECRET=random_32_char_string
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
BOG_CLIENT_ID=your_bog_id
BOG_CLIENT_SECRET=your_bog_secret
NODE_ENV=production
```

## Alternative Hosting Options

### Railway (Full-Stack Friendly)
1. Connect GitHub repo at [railway.app](https://railway.app)
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy automatically

### Render (Free Tier Available)
1. Create account at [render.com](https://render.com)
2. Create new Web Service from GitHub
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

### DigitalOcean App Platform
1. Create app at [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Connect GitHub repository
3. Configure build settings
4. Add managed database
5. Deploy

## Domain Setup

### Custom Domain on Vercel
1. Go to Project Settings > Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Configure DNS records at your domain registrar:
   - Type: `CNAME`
   - Name: `@` (or `www`)
   - Value: `cname.vercel-dns.com`
4. Vercel automatically provisions SSL certificate

### DNS Configuration Examples

#### Cloudflare
```
Type: CNAME
Name: @
Content: cname.vercel-dns.com
Proxy: Orange cloud (enabled)
```

#### Namecheap
```
Type: CNAME Record
Host: @
Value: cname.vercel-dns.com
TTL: Automatic
```

#### GoDaddy
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 1 Hour
```

## Database Setup

### Recommended: Neon (PostgreSQL)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

### Alternative: PlanetScale (MySQL)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string
4. Update schema files for MySQL compatibility

## SSL Certificate
- **Vercel**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL included
- **Render**: Free SSL certificates
- **Custom**: Use Cloudflare for additional security

## Performance Optimization

### CDN Setup
- Vercel includes global CDN
- For other hosts, consider Cloudflare CDN

### Image Optimization
Your project already uses WebP format - excellent for performance!

### Monitoring
- Vercel Analytics (built-in)
- Google Analytics (already configured)
- Sentry for error tracking

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Domain DNS records updated
- [ ] SSL certificate active
- [ ] Email service configured (SendGrid)
- [ ] Payment gateway tested (BOG)
- [ ] Analytics tracking verified
- [ ] Performance monitoring setup

## Troubleshooting

### Common Issues
1. **Build failures**: Check Node.js version (use 18+)
2. **Database connection**: Verify DATABASE_URL format
3. **Environment variables**: Ensure all required vars are set
4. **Domain not working**: Check DNS propagation (24-48 hours)

### Support Resources
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)

## Cost Estimates

### Vercel
- **Hobby**: Free (personal projects)
- **Pro**: $20/month (commercial use)

### Railway
- **Starter**: $5/month
- **Developer**: $10/month

### Render
- **Free**: $0 (limited resources)
- **Starter**: $7/month

### DigitalOcean
- **Basic**: $12/month
- **Professional**: $24/month

## Next Steps After Deployment

1. **Monitor performance** with built-in analytics
2. **Set up backups** for your database
3. **Configure CI/CD** for automatic deployments
4. **Add monitoring** alerts for downtime
5. **Optimize images** and assets for faster loading
6. **Set up staging environment** for testing

---

**Need help?** Check the troubleshooting section or contact support for your chosen platform.
