# 🚀 Vercel Deployment Guide

Deploy your O'Sullivan House booking system to Vercel in minutes!

## 📋 Prerequisites

- [ ] Git repository with your code
- [ ] Vercel account (free at [vercel.com](https://vercel.com))
- [ ] Supabase project set up
- [ ] Environment variables ready

## ⚡ Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is committed and pushed to Git:

```bash
git add .
git commit -m "Production ready for Vercel deployment"
git push origin main
```

### 2. Create Vercel Account & Project

1. **Sign up at Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket
   - Connect your Git provider

2. **Import Project**
   - Click "New Project"
   - Select your repository
   - Vercel auto-detects Next.js

### 3. Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 4. Set Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Optional Variables:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_CLAIM_CODE=your_secure_admin_code
```

### 5. Deploy

1. **Click "Deploy"**
   - Vercel will build and deploy your app
   - First deployment takes 2-3 minutes
   - You'll get a URL like: `https://your-project.vercel.app`

2. **Wait for Deployment**
   - Monitor the build logs
   - Check for any errors
   - Deployment is successful when you see "Ready"

### 6. Configure Supabase

1. **Update Site URL**
   - Go to Supabase Dashboard > Authentication > Settings
   - Set Site URL to your Vercel URL: `https://your-project.vercel.app`
   - Add Redirect URLs: `https://your-project.vercel.app/auth/callback`

2. **Create Admin User**
   - Go to Authentication > Users
   - Click "Add User"
   - Create admin user with email/password
   - Copy the user ID

3. **Set Admin Role**
   - Go to SQL Editor in Supabase
   - Run this query (replace USER_ID):
   ```sql
   INSERT INTO members (user_id, role) 
   VALUES ('USER_ID', 'ADMIN');
   ```

### 7. Test Your Deployment

1. **Visit Your Site**
   - Go to your Vercel URL
   - Test the login functionality
   - Create a test booking
   - Verify admin functions work

2. **Check Admin Features**
   - Login as admin
   - Test user management
   - Test booking approval
   - Test calendar management

## 🔧 Vercel-Specific Optimizations

### 1. Update next.config.js for Vercel

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel optimizations
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['your-domain.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 2. Add Vercel Analytics (Optional)

```bash
npm install @vercel/analytics
```

Add to your `_app.tsx` or `layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🌐 Custom Domain Setup

### 1. Add Domain in Vercel
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS instructions

### 2. Update Supabase
1. Update Site URL to your custom domain
2. Update Redirect URLs
3. Test authentication

## 📊 Monitoring & Analytics

### 1. Vercel Analytics (Free)
- Automatic performance monitoring
- Real user metrics
- Core Web Vitals tracking

### 2. Function Logs
- View serverless function logs
- Monitor API performance
- Debug issues

### 3. Speed Insights
- Page load performance
- Core Web Vitals
- Performance recommendations

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to your main branch:

1. **Push to main** → Automatic deployment
2. **Pull requests** → Preview deployments
3. **Branch deployments** → Test different versions

## 🛠️ Troubleshooting

### Common Issues:

**Build Fails**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Check for TypeScript errors

**Environment Variables Not Working**
- Verify variables are set in Vercel dashboard
- Check variable names match exactly
- Redeploy after adding variables

**Authentication Issues**
- Verify Supabase site URL is correct
- Check redirect URLs in Supabase
- Ensure user exists in Supabase

**Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies are enabled
- Test API endpoints directly

### Getting Help:

1. **Vercel Dashboard** - Check deployment logs
2. **Supabase Dashboard** - Check database logs
3. **Browser Console** - Check for client errors
4. **Network Tab** - Check API calls

## 🎉 You're Live!

Your booking system is now live on Vercel!

**Your Vercel URL**: `https://your-project.vercel.app`

**Next Steps:**
- Set up custom domain
- Configure email notifications
- Set up monitoring alerts
- Test all functionality

**Useful Links:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard)
