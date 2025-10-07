# O'Sullivan House

A production-ready web application for managing a shared holiday home. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Magic Link Authentication**: Secure email-based authentication
- **Role-based Access**: Member and Admin roles with different permissions
- **Booking Management**: Request, approve, and manage bookings with conflict prevention
- **Calendar Integration**: FullCalendar with ICS feed support for external calendar apps
- **Availability Tracking**: Automatic gap calculation and availability display
- **Admin Tools**: Block periods, schedule visits, manage notices
- **Noticeboard**: Community messaging with admin moderation
- **Mobile-friendly**: Responsive design that works on all devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Calendar**: FullCalendar React
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Jest (unit tests), Playwright (e2e tests)

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd osulivansbooks
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > API > Service Role to get your service role key

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DEFAULT_TIMEZONE=Europe/London
```

### 4. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration files in order:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_rls_policies.sql`
   - `migrations/seed.sql`

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage Guide

### First Time Setup

1. **Sign In**: Enter your email address to receive a magic link
2. **Join House**: Use the join code from the seed data (`OSULL-JOIN-2025`)
3. **Claim Admin** (optional): Use the admin claim code (`OSULL-ADMIN-2025`) to become an administrator

### For Members

- **Request Bookings**: Click and drag on the calendar to select dates, then submit a booking request
- **View Availability**: See upcoming bookings, visits, and available gaps
- **Noticeboard**: Read and post notices for the house community
- **Calendar Integration**: Copy the ICS URL to import bookings into your calendar app

### For Admins

- **Approve Bookings**: Review and approve/reject pending booking requests
- **Block Periods**: Create blocked periods for maintenance or other reasons
- **Schedule Visits**: Add maintenance or inspection visits
- **Manage Notices**: Pin, unpin, and delete notices
- **Rotate ICS Token**: Generate new ICS tokens for security

## API Endpoints

### Authentication
- `POST /api/join` - Join the house with a join code
- `POST /api/claim-admin` - Claim admin role with admin claim code

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings/request` - Create a booking request

### Admin
- `GET /api/admin/pending` - Get pending bookings
- `POST /api/admin/bookings/:id/approve` - Approve a booking
- `POST /api/admin/bookings/:id/reject` - Reject a booking
- `POST /api/admin/bookings/:id/hold` - Put a booking on hold
- `POST /api/admin/block` - Create a blocked period
- `POST /api/admin/rotate-ics` - Rotate ICS token

### Visits
- `GET /api/visits` - List all visits
- `POST /api/visits` - Create a visit (admin only)

### Notices
- `GET /api/notices` - List all notices
- `POST /api/notices` - Create a notice

### Calendar
- `GET /api/fullcalendar/events` - Get events for FullCalendar
- `GET /api/fullcalendar/background` - Get background events
- `GET /api/gaps` - Calculate available gaps
- `GET /ics?token=...` - ICS feed for external calendar apps

## Database Schema

### Tables

- **settings**: House configuration (single row)
- **profiles**: User profiles (mirrors auth.users)
- **members**: House membership with roles
- **bookings**: Booking requests and approved bookings
- **visits**: Admin-scheduled visits
- **notices**: Community notices

### Key Features

- **Row Level Security (RLS)**: All tables have RLS enabled with appropriate policies
- **Overlap Prevention**: Database-level EXCLUDE constraint prevents double bookings
- **Timezone Handling**: All dates stored in UTC, displayed in Europe/London
- **Audit Trail**: Created/updated timestamps on all records

## Testing

### Unit Tests

```bash
npm test
```

Tests the gaps calculation utility and other core functions.

### E2E Tests

```bash
npm run test:e2e
```

Tests the complete user flow from sign-in to booking approval.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Features

- **Magic Link Authentication**: No passwords to manage
- **Row Level Security**: Database-level access control
- **Token-based ICS**: Secure calendar feed access
- **Admin-only Actions**: Sensitive operations require admin role
- **Input Validation**: All inputs validated on both client and server

## Troubleshooting

### Common Issues

1. **"Authentication required" errors**: Make sure you're signed in and have joined the house
2. **"Admin access required" errors**: You need to claim admin role with the admin claim code
3. **Calendar not loading**: Check that FullCalendar dependencies are installed
4. **ICS feed not working**: Verify the token in the URL matches the one in settings

### Getting Help

1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure all database migrations have been applied
4. Check Supabase logs for server-side errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the GitHub repository or contact the development team.# Force Vercel deployment with latest TypeScript fixes
# Trigger fresh deployment with all build fixes
# Force Vercel to use latest commit with all fixes
# Force deployment Tue Oct  7 13:29:35 BST 2025
