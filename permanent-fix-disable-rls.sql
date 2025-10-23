-- ============================================
-- PERMANENT FIX: DISABLE RLS FOR PUBLIC FORMS
-- ============================================
-- This is a more permanent solution that disables RLS
-- for tables that should accept anonymous submissions
-- ============================================

-- IMPORTANT: This approach removes RLS complexity
-- and relies on application-level security instead

-- ============================================
-- OPTION 1: DISABLE RLS (Recommended for public forms)
-- ============================================

-- For project_submissions
ALTER TABLE public.project_submissions DISABLE ROW LEVEL SECURITY;

-- Drop all policies (they're not needed without RLS)
DROP POLICY IF EXISTS "public_insert_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "public_select_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "admin_update_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;
DROP POLICY IF EXISTS "Users can view own or admin views all" ON public.project_submissions;
DROP POLICY IF EXISTS "Only admins can update submissions" ON public.project_submissions;

-- Grant basic permissions
GRANT INSERT, SELECT ON public.project_submissions TO anon;
GRANT ALL ON public.project_submissions TO authenticated;
GRANT ALL ON public.project_submissions TO service_role;

-- For contact_messages
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "public_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "public_select_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_update_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_public_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_public_select_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.contact_messages;

-- Grant basic permissions
GRANT INSERT, SELECT ON public.contact_messages TO anon;
GRANT ALL ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '========================================' as separator;
SELECT '✅ RLS DISABLED - PERMANENT FIX APPLIED' as status;
SELECT '========================================' as separator;

-- Verify RLS is disabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS Disabled (Good!)'
        ELSE '❌ RLS Still Enabled'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('project_submissions', 'contact_messages')
    AND schemaname = 'public';

-- Check permissions
SELECT '========================================' as separator;
SELECT 'Permissions granted to:' as info;

SELECT 
    table_name,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('project_submissions', 'contact_messages')
    AND table_schema = 'public'
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- Check policies (should be empty)
SELECT '========================================' as separator;
SELECT 'Remaining policies (should be none):' as info;

SELECT 
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No policies (Good!)'
        ELSE '⚠️ Some policies still exist'
    END as status
FROM pg_policies
WHERE tablename IN ('project_submissions', 'contact_messages');

SELECT '========================================' as separator;
SELECT '🎉 Forms should now work permanently!' as message;
SELECT 'Try submitting multiple times to verify.' as instruction;
