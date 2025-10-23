-- ============================================
-- QUICK FIX FOR PROJECT SUBMISSIONS TABLE
-- ============================================
-- Run this SQL in your Supabase SQL Editor if project submissions aren't working
-- URL: https://rxsynwjpkkfuhrsrksjd.supabase.co

-- Step 1: Drop existing policies and table if needed
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;
DROP POLICY IF EXISTS "Only admins can view all submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Only admins can update submissions" ON public.project_submissions;

-- Step 2: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_submissions (
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

-- Step 3: Enable Row Level Security
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create PERMISSIVE policies for INSERT (allows everyone)
CREATE POLICY "Anyone can submit projects"
    ON public.project_submissions 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Step 5: Create SELECT policy (users can see their own, admins can see all)
CREATE POLICY "Users can view own or admin views all"
    ON public.project_submissions 
    FOR SELECT
    TO anon, authenticated
    USING (
        -- Allow if no auth (will fail but policy won't block)
        auth.uid() IS NULL
        OR
        -- Allow if user's email matches
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR
        -- Allow if user is admin
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Step 6: Create UPDATE policy (only admins)
CREATE POLICY "Only admins can update submissions"
    ON public.project_submissions 
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Step 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.project_submissions TO anon, authenticated;
GRANT SELECT ON public.project_submissions TO anon, authenticated;
GRANT UPDATE ON public.project_submissions TO authenticated;

-- Step 8: Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_project_submissions_updated_at ON public.project_submissions;
CREATE TRIGGER update_project_submissions_updated_at 
    BEFORE UPDATE ON public.project_submissions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_submissions_email 
    ON public.project_submissions(email);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status 
    ON public.project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_project_submissions_created_at 
    ON public.project_submissions(created_at DESC);

-- ============================================
-- VERIFICATION
-- ============================================

-- Test 1: Check table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_submissions'
    ) THEN
        RAISE NOTICE '✅ Table project_submissions exists';
    ELSE
        RAISE NOTICE '❌ Table project_submissions does NOT exist';
    END IF;
END
$$;

-- Test 2: Check RLS is enabled
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'project_submissions'
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS is enabled';
    ELSE
        RAISE NOTICE '❌ RLS is NOT enabled';
    END IF;
END
$$;

-- Test 3: List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'project_submissions';

-- Test 4: Try inserting a test record (will show if INSERT works)
-- Comment out this line if you don't want test data
-- INSERT INTO public.project_submissions (name, email, department, project_title, project_description)
-- VALUES ('Test User', 'test@example.com', 'Computer Science', 'Test Project', 'This is a test submission');

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see ✅ messages above, the table is ready!
-- Now try submitting from your application.
-- 
-- If you still have issues:
-- 1. Check browser console for errors
-- 2. Check Network tab for API errors
-- 3. Verify .env.local has correct credentials
-- 4. Restart your dev server: npm run dev
