# Form Submission Hanging - Troubleshooting Guide

## Problem
Project Submission Form and Contact Form are getting stuck on "Submitting..." with no error messages and no data saved to Supabase.

## Root Cause
This is almost always caused by **Row Level Security (RLS) policies** blocking INSERT operations from anonymous users.

## Quick Fix

### Step 1: Run the Fix SQL Script
1. Open Supabase Dashboard: https://tvbgytfvkayvghomzuzb.supabase.co
2. Go to **SQL Editor**
3. Open the file: `fix-all-forms.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run**
7. Check the output for ✅ checkmarks

### Step 2: Verify in Browser Console
1. Open your website
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Try submitting a form
5. Look for these log messages:

**Expected Console Output (Success):**
```
🚀 Starting project submission...
📋 Form data: {department: "computer-science", email: "test@gmail.com", ...}
📤 Sending to Supabase: {...}
📤 projectService.submit called with: {...}
🔌 Supabase client exists: true
📬 Supabase response: {data: {...}, error: null}
✅ Project submitted successfully! {...}
🏁 Submission process completed
```

**Problem Console Output (Hanging):**
```
🚀 Starting project submission...
📋 Form data: {...}
📤 Sending to Supabase: {...}
📤 projectService.submit called with: {...}
🔌 Supabase client exists: true
[Then nothing - request hangs indefinitely]
```

**Problem Console Output (RLS Error):**
```
🚀 Starting project submission...
...
❌ Error submitting project: {...}
Error: new row violates row-level security policy
```

## Detailed Diagnosis

### Check 1: Verify Tables Exist
Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_submissions', 'contact_messages');
```

Expected: Should return both table names.

### Check 2: Verify RLS Policies
Run in Supabase SQL Editor:
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('project_submissions', 'contact_messages')
ORDER BY tablename, policyname;
```

Expected policies:
- `project_submissions`:
  - `public_insert_project_submissions` (INSERT, {public})
  - `public_select_project_submissions` (SELECT, {public})
  
- `contact_messages`:
  - `public_insert_contact` (INSERT, {public})
  - `public_select_contact` (SELECT, {public})

### Check 3: Test Direct Insert
Run in Supabase SQL Editor:
```sql
-- Test project submission
INSERT INTO public.project_submissions (name, email, department, project_title, project_description)
VALUES ('Test User', 'test@example.com', 'computer-science', 'Test Project', 'Test description');

-- Test contact message
INSERT INTO public.contact_messages (name, email, inquiry_type, message)
VALUES ('Test User', 'test@example.com', 'general', 'Test message');

-- Check if data was inserted
SELECT * FROM public.project_submissions ORDER BY created_at DESC LIMIT 1;
SELECT * FROM public.contact_messages ORDER BY created_at DESC LIMIT 1;
```

If this works in SQL Editor but not from the app, the issue is with the RLS policies or permissions.

### Check 4: Verify Environment Variables
Check `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tvbgytfvkayvghomzuzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Make sure:
- ✅ URL matches your Supabase project
- ✅ Anon key is the correct one from your project settings
- ✅ No extra spaces or quotes

### Check 5: Network Tab Inspection
1. Open DevTools → **Network** tab
2. Filter by "Fetch/XHR"
3. Submit the form
4. Look for requests to `tvbgytfvkayvghomzuzb.supabase.co`
5. Click on the request
6. Check **Response** tab

**If request is pending forever:** RLS policy is blocking the INSERT
**If request returns 401:** Authentication issue
**If request returns 400:** Data validation error
**If request returns 200:** Success! Check why the UI isn't updating

## Common Solutions

### Solution 1: RLS Policy Too Restrictive
**Problem:** Policy requires authentication but form is used by anonymous users

**Fix:** Use `TO public` instead of `TO authenticated` for INSERT policies
```sql
CREATE POLICY "public_insert_project_submissions"
    ON public.project_submissions
    FOR INSERT
    TO public  -- This is key! 'public' includes 'anon'
    WITH CHECK (true);
```

### Solution 2: Missing GRANT Permissions
**Problem:** Table has policies but no explicit grants

**Fix:**
```sql
GRANT INSERT, SELECT ON public.project_submissions TO anon;
GRANT INSERT, SELECT ON public.contact_messages TO anon;
```

### Solution 3: Conflicting Policies
**Problem:** Multiple policies with different conditions

**Fix:** Drop all policies and recreate with simple permissive ones
```sql
-- Drop all existing
DROP POLICY IF EXISTS "old_policy_name" ON public.project_submissions;

-- Create new simple one
CREATE POLICY "public_insert_project_submissions"
    ON public.project_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);
```

### Solution 4: Cache/Session Issues
**Problem:** Old credentials or session cached

**Fix:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Restart dev server:
   ```bash
   npm run dev
   ```
4. Try in incognito mode

## Testing After Fix

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Open Console** (F12)
3. **Submit test data:**
   - Project: Name="Test", Email="test@test.com", Dept="Computer Science"
   - Contact: Name="Test", Email="test@test.com", Type="General"
4. **Check Console** for ✅ success messages
5. **Verify in Supabase:**
   - Go to Table Editor
   - Check `project_submissions` and `contact_messages` tables
   - Should see your test data

## If Still Not Working

1. **Take Screenshots:**
   - Browser Console output
   - Network tab showing the hanging request
   - Supabase RLS policies page

2. **Check Service Files:**
   - `lib/services/project.service.ts`
   - `lib/services/contact.service.ts`
   - Ensure they're using correct table names

3. **Verify Supabase Client:**
   ```typescript
   // In lib/supabase.ts
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
   ```

4. **Check for TypeScript Errors:**
   - Run `npm run build` to check for compilation errors
   - Fix any type mismatches

## Success Indicators

✅ Console shows "✅ Project submitted successfully!"  
✅ Toast notification appears  
✅ Form shows success message  
✅ Data appears in Supabase Table Editor  
✅ No errors in Browser Console or Network tab  

## Remember

The pattern for anonymous form submissions:
1. RLS must be **enabled**
2. INSERT policy must use `TO public` (not `TO authenticated`)
3. Policy must have `WITH CHECK (true)` for permissive access
4. Explicit `GRANT INSERT TO anon` is required
5. Both `anon` and `authenticated` roles should have permissions
