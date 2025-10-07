# 🚀 Production Deployment Guide

This guide will help you deploy the O'Sullivan House booking system to production.

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Supabase Account](https://supabase.com/)
- [Vercel Account](https://vercel.com/) (recommended) or [Netlify](https://netlify.com/)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Choose a region close to your users
3. Set a strong database password
4. Wait for the project to be created

### 2. Run Database Migrations
1. Go to the SQL Editor in your Supabase dashboard
2. Run the migration files in order:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_rls_policies.sql`
   - `migrations/003_add_bedroom_count.sql`

### 3. Configure Authentication
1. Go to Authentication > Settings in Supabase
2. Add your production domain to "Site URL"
3. Add your production domain to "Redirect URLs"
4. Configure email templates if needed

### 4. Set up Row Level Security (RLS)
The RLS policies are already included in the migrations, but verify they're active:
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
```

## 🌐 Hosting Setup (Vercel - Recommended)

### 1. Prepare Your Repository
```bash
# Make sure your code is in a Git repository
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect it's a Next.js project
5. Configure environment variables (see below)
6. Click "Deploy"

### 3. Environment Variables
Set these in your Vercel project settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (if using email features)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_CLAIM_CODE=your_secure_admin_code
```

## 🔧 Production Optimizations

### 1. Update Supabase Configuration
Create a production Supabase client configuration:

```typescript
// lib/supabase-prod.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### 2. Security Headers
Add security headers in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
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

### 3. Remove Development Features
Update authentication to remove hardcoded users:

```typescript
// Remove hardcoded users from auth-provider.tsx
const signInWithPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
```

## 📧 Email Configuration

### Option 1: Supabase Auth (Recommended)
1. Go to Authentication > Settings in Supabase
2. Configure SMTP settings
3. Set up email templates

### Option 2: Custom SMTP
1. Use services like SendGrid, Mailgun, or AWS SES
2. Configure SMTP settings in environment variables
3. Update email functions to use your SMTP provider

## 🔒 Security Checklist

- [ ] Remove hardcoded admin credentials
- [ ] Set up proper RLS policies
- [ ] Configure CORS settings
- [ ] Set up rate limiting
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 📊 Monitoring & Analytics

### 1. Error Tracking
Add Sentry for error tracking:
```bash
npm install @sentry/nextjs
```

### 2. Analytics
Add Google Analytics or similar:
```bash
npm install @vercel/analytics
```

## 🚀 Deployment Steps

1. **Prepare Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   
   # Test locally
   npm start
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Configure Domain**
   - Add your custom domain in Vercel
   - Update DNS settings
   - Update Supabase site URL

## 🔄 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛠️ Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs
- [ ] Backup database regularly
- [ ] Review security settings
- [ ] Update SSL certificates

### Monitoring
- Set up uptime monitoring
- Monitor database performance
- Track user analytics
- Monitor error rates

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review environment variables
4. Test API endpoints

## 🔗 Useful Links

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
