# Troubleshooting: Project Submission Form

## Issue: Form gets stuck on "Submitting Project Idea..."

This guide will help you debug and fix the project submission issue.

---

## Step 1: Check Browser Console (MOST IMPORTANT)

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Try submitting a project
4. Look for error messages with these emojis:
   - 🚀 Starting project submission...
   - 📋 Form data
   - 📤 Sending to Supabase
   - 📥 Supabase response
   - ✅ Success OR ❌ Error

**Copy all the console output and check the error messages below.**

---

## Common Issues & Solutions

### Error 1: "relation 'public.project_submissions' does not exist"

**Cause:** The database table hasn't been created yet.

**Solution:**
1. Go to your Supabase Dashboard: https://rxsynwjpkkfuhrsrksjd.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Open `supabase-schema.sql` from your project
4. Copy **ALL** the content
5. Paste into Supabase SQL Editor
6. Click **"RUN"**
7. Wait for success message
8. Try submitting again

---

### Error 2: "new row violates row-level security policy"

**Cause:** The RLS policy isn't allowing anonymous inserts.

**Solution:**

Run this SQL in Supabase SQL Editor:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;

-- Create new policy that explicitly allows anonymous inserts
CREATE POLICY "Anyone can submit projects"
    ON public.project_submissions 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);
```

---

### Error 3: "permission denied for table project_submissions"

**Cause:** Table permissions not granted.

**Solution:**

Run this SQL in Supabase SQL Editor:

```sql
-- Grant permissions to anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.project_submissions TO anon, authenticated;
GRANT SELECT ON public.project_submissions TO authenticated;
```

---

### Error 4: Connection timeout or network error

**Cause:** Supabase connection issue.

**Solution:**

1. Check `.env.local` file exists with correct credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://rxsynwjpkkfuhrsrksjd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. Clear browser cache (Ctrl+Shift+Delete)

---

### Error 5: "insert or update on table violates foreign key constraint"

**Cause:** Table has foreign key constraints that aren't satisfied.

**Solution:**

The project_submissions table shouldn't have foreign keys. Verify the table structure:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_submissions';
```

Expected columns:
- id (uuid, not null)
- name (text, not null)
- email (text, not null)
- department (text, not null)
- project_title (text, not null)
- project_description (text, not null)
- resources (text, nullable)
- status (text, not null, default 'pending')
- created_at (timestamptz, not null)
- updated_at (timestamptz, not null)

---

### Error 6: Form data is empty

**Cause:** Form state not updating correctly.

**Solution:**

Check the console for "📋 Form data". If all fields are empty:

1. Make sure you filled out ALL required fields (marked with *)
2. Try refreshing the page
3. Check if the Select component for department is working

---

## Step 2: Verify Supabase Configuration

### Check Environment Variables

1. Verify `.env.local` exists in project root
2. Content should be:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://rxsynwjpkkfuhrsrksjd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c3lud2pwa2tmdWhyc3Jrc2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjc2MjIsImV4cCI6MjA3Njc0MzYyMn0.7tOztgv4TL4Bq97hV6LX9x7g7Ku0QOJPiUKF6aSrVSE
   ```

### Check Supabase Table

1. Go to Supabase Dashboard → **Table Editor**
2. Look for `project_submissions` table
3. If it doesn't exist, run the schema (see Error 1 solution)

### Check RLS Policies

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Find `project_submissions` table
3. Should have policy: "Anyone can submit projects"
4. Type: INSERT
5. Target roles: anon, authenticated
6. USING expression: (none)
7. WITH CHECK expression: true

---

## Step 3: Test with Supabase Dashboard

Try inserting directly via Supabase:

1. Go to **Table Editor** → `project_submissions`
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - name: Test User
   - email: test@example.com
   - department: Computer Science
   - project_title: Test Project
   - project_description: This is a test
   - resources: (leave empty or add text)
4. Click **"Save"**

**If this works:** Issue is in the frontend code  
**If this fails:** Issue is in the database/RLS policies

---

## Step 4: Check Network Tab

1. Open Developer Tools → **Network** tab
2. Filter by "Fetch/XHR"
3. Try submitting the form
4. Look for a request to `supabase.co`
5. Click on it and check:
   - **Request Headers**: Should have apikey
   - **Request Payload**: Should have your form data
   - **Response**: Check for error messages

---

## Step 5: Temporary Debug Mode

The form now has enhanced logging. When you submit:

1. Open Console
2. You should see:
   - 🚀 Starting project submission...
   - 📋 Form data: {your data}
   - 📤 Sending to Supabase: {transformed data}
   - 📥 Supabase response: {data or error}
   - Either ✅ Success or ❌ Error details

**Share the console output to get specific help.**

---

## Quick Fix: Reset Everything

If nothing works, try this complete reset:

### 1. Drop and Recreate Table

```sql
-- Drop table (WARNING: deletes all data)
DROP TABLE IF EXISTS public.project_submissions CASCADE;

-- Recreate table
CREATE TABLE public.project_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    project_title TEXT NOT NULL,
    project_description TEXT NOT NULL,
    resources TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for everyone
CREATE POLICY "Anyone can submit projects"
    ON public.project_submissions 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Create SELECT policy for admins and own submissions
CREATE POLICY "Users can view own submissions"
    ON public.project_submissions 
    FOR SELECT
    TO authenticated
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant permissions
GRANT INSERT ON public.project_submissions TO anon, authenticated;
GRANT SELECT ON public.project_submissions TO authenticated;
```

### 2. Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 3. Clear Browser Cache

- Press Ctrl+Shift+Delete
- Clear cached images and files
- Refresh page (F5)

---

## Still Not Working?

### Check These Files:

1. **`.env.local`** - Environment variables correct?
2. **`lib/supabase.ts`** - Client initialized properly?
3. **Browser Console** - Any JavaScript errors?
4. **Supabase Logs** - Check Database → Logs in Supabase

### Get Help:

Share this information:
1. Console output when submitting
2. Network tab response
3. Supabase table structure (screenshot)
4. RLS policies (screenshot)

---

## Success Checklist

After fixing, verify:
- [ ] Form submits without getting stuck
- [ ] Console shows ✅ success message
- [ ] Data appears in Supabase `project_submissions` table
- [ ] Success message appears on screen
- [ ] Form resets or shows confirmation

---

## Prevention

To avoid this issue in the future:
1. Always run the complete schema SQL first
2. Verify tables exist before testing
3. Check RLS policies are created
4. Test with Supabase dashboard before testing in app
5. Keep browser console open during testing

---

**Good luck! 🚀**
