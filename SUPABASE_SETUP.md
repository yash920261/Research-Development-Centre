# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for the R&D Center website.

## Prerequisites

- A Supabase account (https://supabase.com)
- Node.js and npm installed
- Your Supabase project URL and anon key

## Setup Steps

### 1. Environment Variables

The `.env.local` file has already been created with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rxsynwjpkkfuhrsrksjd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `supabase-schema.sql` in the project root
4. Copy and paste the entire SQL content into the Supabase SQL Editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, faculty, forum_topics, forum_replies, forum_likes, project_submissions)
- Row Level Security (RLS) policies
- Database triggers and functions
- Indexes for performance optimization

### 3. Install Dependencies

Dependencies have already been installed:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs --legacy-peer-deps
```

### 4. Authentication Setup

The authentication is configured to use Supabase Auth. Users can:
- Sign up with email and password
- Sign in with email and password
- Automatically have a profile created in the `profiles` table

To configure authentication providers in Supabase:
1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Email provider (already enabled by default)
3. (Optional) Enable other providers like Google, GitHub, etc.

### 5. Database Structure

#### Tables Created:

**profiles**
- Extends Supabase auth.users with additional user information
- Fields: id, email, name, role (student/admin), department

**faculty**
- Stores faculty member information
- Fields: name, title, department, email, phone, office, specialization, research_interests, publications, projects, web_profile (JSONB), analytics (JSONB)

**forum_topics**
- Stores discussion topics
- Fields: title, content, author details, category, tags, views, likes

**forum_replies**
- Stores replies to forum topics
- Fields: topic_id, author details, content, likes

**forum_likes**
- Tracks user likes on topics and replies
- Prevents duplicate likes with unique constraints

**project_submissions**
- Stores student project submissions
- Fields: name, email, department, project_title, project_description, resources, status

### 6. Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

**Public Read Access:**
- Faculty profiles
- Forum topics and replies
- Forum likes (read-only)

**Authenticated User Access:**
- Create forum topics and replies
- Like/unlike topics and replies
- Submit projects
- Manage own profile

**Admin Access:**
- Full CRUD on faculty members
- View all project submissions
- Update project submission status

### 7. Testing the Setup

After running the SQL schema:

1. **Test Authentication:**
   - Create a new account on the website
   - Check the `profiles` table in Supabase to verify the profile was created

2. **Test Faculty CRUD (Admin Only):**
   - Sign up with an admin account
   - Add a faculty member
   - Edit and delete faculty members

3. **Test Forum:**
   - Create a new discussion topic
   - Add replies to topics
   - Like/unlike topics and replies

4. **Test Project Submissions:**
   - Submit a project idea
   - Check the `project_submissions` table

### 8. Creating an Admin User

After signup, you need to manually set a user as admin:

1. Go to Supabase Dashboard → Table Editor → profiles
2. Find the user you want to make admin
3. Edit the row and change `role` from `student` to `admin`
4. Save changes

### 9. Data Migration

If you have existing data in localStorage, it will need to be migrated to Supabase manually:

1. Export data from browser localStorage
2. Transform the data to match the database schema
3. Insert using Supabase dashboard or SQL queries

### 10. Key Files Modified

**Services (Data Layer):**
- `lib/services/faculty.service.ts` - Faculty CRUD operations
- `lib/services/forum.service.ts` - Forum operations
- `lib/services/project.service.ts` - Project submission operations

**Authentication:**
- `contexts/auth-context.tsx` - Supabase Auth integration
- `lib/supabase.ts` - Supabase client configuration

**Components Updated:**
- `components/add-faculty-dialog.tsx`
- `components/edit-faculty-dialog.tsx`
- `components/delete-faculty-dialog.tsx`
- `components/new-discussion-form.tsx`
- `components/project-submission-form.tsx`

**Pages Updated:**
- `app/faculty/page.tsx`
- `app/faculty/[id]/page.tsx`

### 11. Troubleshooting

**Issue: Can't connect to Supabase**
- Verify your environment variables are correct
- Check if `.env.local` is in the root directory
- Restart the development server

**Issue: Permission denied errors**
- Check RLS policies in Supabase dashboard
- Verify user authentication status
- Ensure user role is set correctly for admin operations

**Issue: Data not appearing**
- Check browser console for errors
- Verify data exists in Supabase tables
- Check network tab for failed API calls

### 12. Development

Run the development server:

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

### 13. Production Deployment

Before deploying:
1. Ensure all environment variables are set in your hosting platform
2. Test all features in staging environment
3. Verify RLS policies are correctly configured
4. Check that all database indexes are created

### 14. Security Notes

- Never commit `.env.local` to version control (already in `.gitignore`)
- The anon key is safe to expose in client-side code
- All sensitive operations are protected by RLS policies
- Admin operations require proper role verification

### 15. Next Steps

1. Run the SQL schema in Supabase
2. Create your first admin account
3. Test all features
4. Customize the application as needed

## Support

For issues with:
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- This project: Check the code comments and TypeScript types

## License

This project is part of the Manav Rachna R&D Center website.
