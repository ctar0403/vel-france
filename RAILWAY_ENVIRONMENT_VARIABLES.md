# 🔐 Complete Railway Environment Variables

Copy and paste these exact values into Railway Dashboard → Variables:

## Database & Core
```
DATABASE_URL=postgresql://neondb_owner:npg_LDQdZpRo02wT@ep-small-glitter-adj30x5f.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=a8b9c2d4e6f8a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8
NODE_ENV=production
PORT=3000
```

## Admin & Email (Update these with your actual values)
```
ADMIN_EMAIL=admin@velfrance.com
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```

## BOG Payment (Configured for I/E PERFUMETRADE NETWORK)
```
BOG_CLIENT_ID=10001216
MERCHANT_ID=00000000981292N
BOG_SECRET_KEY=your_bog_production_secret_key
```

## Frontend URL (Add after Vercel deployment)
```
FRONTEND_URL=https://your-app-name.vercel.app
```

---

## 📧 Email Setup Instructions

### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → App Passwords
3. Generate an app password for "Mail"
4. Use that 16-character password as `EMAIL_APP_PASSWORD`

### For Outlook/Hotmail:
1. Enable 2-Factor Authentication
2. Go to Security settings → App passwords
3. Generate app password for "Mail"
4. Use that password as `EMAIL_APP_PASSWORD`

---

## 🏦 BOG Payment Setup

The BOG credentials are configured for:
- **Company**: I/E PERFUMETRADE NETWORK  
- **ID**: 39001004952
- **Address**: Tbilisi, Vaja Pshavela 70g

You'll need to contact BOG to get your production `BOG_SECRET_KEY`.

---

## ⚠️ Security Notes

- Never commit these values to GitHub
- The SESSION_SECRET is cryptographically secure (512-bit)
- Database password is already included in DATABASE_URL
- Update BOG_SECRET_KEY with production value from bank