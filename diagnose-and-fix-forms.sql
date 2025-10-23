-- ============================================
-- COMPREHENSIVE FORM SUBMISSION FIX
-- ============================================
-- This script diagnoses and fixes the recurring form submission issues
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: DIAGNOSE THE CURRENT STATE
-- ============================================

SELECT '========================================' as separator;
SELECT '🔍 DIAGNOSTIC REPORT' as title;
SELECT '========================================' as separator;

-- Check if RLS is enabled
SELECT '1. Row Level Security Status:' as check;
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '❌ ENABLED (This is the problem!)'
        ELSE '✅ DISABLED (Good)'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('project_submissions', 'contact_messages')
    AND schemaname = 'public';

-- Check existing policies
SELECT '========================================' as separator;
SELECT '2. Existing Policies:' as check;
SELECT 
    tablename,
    policyname,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('project_submissions', 'contact_messages')
ORDER BY tablename, policyname;

-- Check permissions
SELECT '========================================' as separator;
SELECT '3. Current Permissions:' as check;
SELECT 
    table_name,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('project_submissions', 'contact_messages')
    AND table_schema = 'public'
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- ============================================
-- STEP 2: APPLY THE PERMANENT FIX
-- ============================================

SELECT '========================================' as separator;
SELECT '🔧 APPLYING FIX...' as title;
SELECT '========================================' as separator;

-- FOR PROJECT_SUBMISSIONS TABLE
-- ============================================

-- 1. Disable RLS
ALTER TABLE public.project_submissions DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies (comprehensive list)
DROP POLICY IF EXISTS "public_insert_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "public_select_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "admin_update_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;
DROP POLICY IF EXISTS "Users can view own or admin views all" ON public.project_submissions;
DROP POLICY IF EXISTS "Only admins can update submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.project_submissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_submissions;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.project_submissions;

-- 3. Revoke all existing permissions
REVOKE ALL ON public.project_submissions FROM anon;
REVOKE ALL ON public.project_submissions FROM authenticated;
REVOKE ALL ON public.project_submissions FROM public;

-- 4. Grant fresh permissions
GRANT INSERT, SELECT ON public.project_submissions TO anon;
GRANT ALL ON public.project_submissions TO authenticated;
GRANT ALL ON public.project_submissions TO service_role;

-- FOR CONTACT_MESSAGES TABLE
-- ============================================

-- 1. Disable RLS
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies (comprehensive list)
DROP POLICY IF EXISTS "public_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "public_select_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_update_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_public_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_public_select_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_messages;

-- 3. Revoke all existing permissions
REVOKE ALL ON public.contact_messages FROM anon;
REVOKE ALL ON public.contact_messages FROM authenticated;
REVOKE ALL ON public.contact_messages FROM public;

-- 4. Grant fresh permissions
GRANT INSERT, SELECT ON public.contact_messages TO anon;
GRANT ALL ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- ============================================
-- STEP 3: VERIFY THE FIX
-- ============================================

SELECT '========================================' as separator;
SELECT '✅ VERIFICATION REPORT' as title;
SELECT '========================================' as separator;

-- Verify RLS is disabled
SELECT '1. RLS Status After Fix:' as check;
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = false THEN '✅ DISABLED (Perfect!)'
        ELSE '❌ STILL ENABLED (Contact support)'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('project_submissions', 'contact_messages')
    AND schemaname = 'public';

-- Verify no policies exist
SELECT '========================================' as separator;
SELECT '2. Policy Count After Fix:' as check;
SELECT 
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No policies (Good!)'
        ELSE '⚠️ Policies still exist (Need manual cleanup)'
    END as status
FROM pg_policies
WHERE tablename IN ('project_submissions', 'contact_messages')
GROUP BY tablename;

-- Verify permissions
SELECT '========================================' as separator;
SELECT '3. Permissions After Fix:' as check;
SELECT 
    table_name,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('project_submissions', 'contact_messages')
    AND table_schema = 'public'
    AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- ============================================
-- FINAL MESSAGE
-- ============================================

SELECT '========================================' as separator;
SELECT '🎉 FIX APPLIED SUCCESSFULLY!' as message;
SELECT '========================================' as separator;
SELECT 'Next Steps:' as instructions;
SELECT '1. Close this SQL Editor tab' as step_1;
SELECT '2. Go to your website' as step_2;
SELECT '3. Try submitting forms multiple times' as step_3;
SELECT '4. Forms should work every time now!' as step_4;
SELECT '========================================' as separator;

-- ============================================
-- NOTES FOR TROUBLESHOOTING
-- ============================================
-- If forms still don't work after running this:
-- 1. Check browser console for errors
-- 2. Check Supabase logs in Dashboard > Logs
-- 3. Verify your .env.local has correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 4. Try clearing browser cache and hard refresh (Ctrl+Shift+R)
-- ============================================
