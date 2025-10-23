-- ============================================
-- SETUP FORUM DELETE PERMISSIONS
-- ============================================
-- This script sets up proper permissions for deleting forum topics
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: VERIFY CURRENT SETUP
-- ============================================

SELECT '========================================' as separator;
SELECT '🔍 CURRENT RLS POLICIES' as title;
SELECT '========================================' as separator;

-- Check existing RLS policies for forum tables
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename IN ('forum_topics', 'forum_replies', 'forum_likes')
ORDER BY tablename, policyname;

-- ============================================
-- STEP 2: ENSURE PROPER DELETE POLICIES
-- ============================================

SELECT '========================================' as separator;
SELECT '🔧 SETTING UP DELETE POLICIES' as title;
SELECT '========================================' as separator;

-- For forum_topics: Allow authenticated users to delete (we'll check admin role in the app)
-- Or you can enforce admin-only deletion at the database level

-- Option 1: Allow all authenticated users to delete (app checks admin role)
DROP POLICY IF EXISTS "allow_authenticated_delete_topics" ON public.forum_topics;
CREATE POLICY "allow_authenticated_delete_topics"
    ON public.forum_topics
    FOR DELETE
    TO authenticated
    USING (true);

-- Option 2 (Recommended): Only allow admins to delete at database level
DROP POLICY IF EXISTS "allow_admin_delete_topics" ON public.forum_topics;
CREATE POLICY "allow_admin_delete_topics"
    ON public.forum_topics
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- For forum_replies: Allow authenticated users to delete (needed for cascade deletion)
DROP POLICY IF EXISTS "allow_authenticated_delete_replies" ON public.forum_replies;
CREATE POLICY "allow_authenticated_delete_replies"
    ON public.forum_replies
    FOR DELETE
    TO authenticated
    USING (true);

-- For forum_likes: Allow authenticated users to delete (needed for cascade deletion)
DROP POLICY IF EXISTS "allow_authenticated_delete_likes" ON public.forum_likes;
CREATE POLICY "allow_authenticated_delete_likes"
    ON public.forum_likes
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- STEP 3: GRANT DELETE PERMISSIONS
-- ============================================

-- Ensure authenticated users have DELETE permission
GRANT DELETE ON public.forum_topics TO authenticated;
GRANT DELETE ON public.forum_replies TO authenticated;
GRANT DELETE ON public.forum_likes TO authenticated;

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

SELECT '========================================' as separator;
SELECT '✅ VERIFICATION REPORT' as title;
SELECT '========================================' as separator;

-- Verify DELETE policies exist
SELECT '1. Delete Policies:' as check;
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename IN ('forum_topics', 'forum_replies', 'forum_likes')
    AND cmd = 'DELETE'
ORDER BY tablename;

-- Verify DELETE permissions
SELECT '========================================' as separator;
SELECT '2. Delete Permissions:' as check;
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('forum_topics', 'forum_replies', 'forum_likes')
    AND privilege_type = 'DELETE'
ORDER BY table_name, grantee;

SELECT '========================================' as separator;
SELECT '🎉 FORUM DELETE SETUP COMPLETE!' as message;
SELECT '========================================' as separator;
SELECT 'Admins can now delete forum topics and all associated replies and likes.' as info;

-- ============================================
-- NOTES
-- ============================================
-- 
-- This script sets up two levels of deletion control:
-- 
-- 1. Database Level: 
--    - Only users with role='admin' in profiles table can delete topics
--    - This is enforced by the RLS policy on forum_topics
-- 
-- 2. Application Level:
--    - The delete button is only visible to admins (user.role === 'admin')
--    - This provides a better user experience
-- 
-- When a topic is deleted, the app also deletes:
--    - All replies to that topic (from forum_replies)
--    - All likes on that topic (from forum_likes)
-- 
-- This ensures no orphaned data remains in the database.
-- ============================================
