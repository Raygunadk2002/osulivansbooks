# 🚀 Quick Start - Production Deployment

Get your O'Sullivan House booking system live in production in 30 minutes!

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git repository set up
- [ ] Supabase account
- [ ] Vercel account (free tier works)

## ⚡ Quick Deployment Steps

### 1. Set Up Supabase (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com/)
   - Click "New Project"
   - Choose region and set password
   - Wait for project creation

2. **Run Database Migrations**
   - Go to SQL Editor in Supabase
   - Copy and run each file in order:
     ```
     migrations/001_initial_schema.sql
     migrations/002_rls_policies.sql
     migrations/003_add_bedroom_count.sql
     ```

3. **Get Your Keys**
   - Go to Settings > API
   - Copy your Project URL and anon key

### 2. Deploy to Vercel (10 minutes)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your Git repository
   - Vercel auto-detects Next.js

2. **Set Environment Variables**
   In Vercel project settings, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### 3. Configure Supabase (5 minutes)

1. **Update Site URL**
   - Go to Authentication > Settings
   - Set Site URL to your Vercel domain
   - Add Redirect URLs: `https://your-domain.vercel.app/auth/callback`

2. **Create Admin User**
   - Go to Authentication > Users
   - Click "Add User"
   - Create admin user with email/password
   - Note the user ID

3. **Set Admin Role**
   - Go to SQL Editor
   - Run this query (replace USER_ID):
   ```sql
   INSERT INTO members (user_id, role) 
   VALUES ('USER_ID', 'ADMIN');
   ```

### 4. Test Your Deployment (5 minutes)

1. **Visit Your Site**
   - Go to your Vercel URL
   - Test login with admin credentials
   - Create a test booking
   - Verify calendar works

2. **Check Admin Functions**
   - Login as admin
   - Test user management
   - Test booking approval
   - Test calendar management

## 🔧 Optional: Custom Domain

1. **Add Domain in Vercel**
   - Go to project settings
   - Add your custom domain
   - Update DNS records

2. **Update Supabase**
   - Update Site URL to your custom domain
   - Update Redirect URLs

## 🛡️ Security Checklist

- [ ] Remove hardcoded users (use production auth)
- [ ] Set strong admin passwords
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Review RLS policies
- [ ] Set up monitoring

## 📊 Monitoring Setup

1. **Vercel Analytics** (Free)
   - Enable in project settings
   - Monitor performance and errors

2. **Supabase Monitoring**
   - Check database logs
   - Monitor API usage

## 🆘 Troubleshooting

### Common Issues:

**"Failed to fetch bookings"**
- Check Supabase URL and keys
- Verify RLS policies are enabled
- Check network tab for API errors

**"Authentication failed"**
- Verify Supabase site URL
- Check redirect URLs
- Ensure user exists in Supabase

**"Database errors"**
- Run migrations again
- Check RLS policies
- Verify table permissions

### Getting Help:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console
4. Test API endpoints directly

## 🎉 You're Live!

Your booking system is now production-ready! 

**Next Steps:**
- Set up email notifications
- Add custom branding
- Configure backup strategies
- Set up monitoring alerts

**Useful Links:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Full Deployment Guide](./DEPLOYMENT.md)
