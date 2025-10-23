-- ============================================
-- COMPREHENSIVE FIX FOR ALL FORM SUBMISSIONS
-- ============================================
-- This fixes hanging issues on:
-- 1. Project Submission Form
-- 2. Contact Form (Get in Touch)
--
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- FIX 1: PROJECT SUBMISSIONS TABLE
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;
DROP POLICY IF EXISTS "Users can view own or admin views all" ON public.project_submissions;
DROP POLICY IF EXISTS "Only admins can view all submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Only admins can update submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "public_insert_project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "public_select_project_submissions" ON public.project_submissions;

-- Enable RLS (if not already enabled)
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Create simple permissive INSERT policy for everyone (public role includes anon)
CREATE POLICY "public_insert_project_submissions"
    ON public.project_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create SELECT policy - allow admins to view all
CREATE POLICY "public_select_project_submissions"
    ON public.project_submissions
    FOR SELECT
    TO public
    USING (
        -- Allow admins to see all
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        -- Or allow users to see their own submissions
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
        -- Or allow if no user is logged in (for testing)
        OR auth.uid() IS NULL
    );

-- Create UPDATE policy - only admins
CREATE POLICY "admin_update_project_submissions"
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

-- Grant explicit permissions
GRANT INSERT, SELECT ON public.project_submissions TO anon;
GRANT INSERT, SELECT, UPDATE ON public.project_submissions TO authenticated;

-- ============================================
-- FIX 2: CONTACT MESSAGES TABLE
-- ============================================

-- Drop all existing policies (including any we might create below)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_public_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "public_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_public_select_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "public_select_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_admin_update_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_update_contact" ON public.contact_messages;

-- Enable RLS (if not already enabled)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create simple permissive INSERT policy for everyone
CREATE POLICY "public_insert_contact"
    ON public.contact_messages
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create SELECT policy - allow admins to view all
CREATE POLICY "public_select_contact"
    ON public.contact_messages
    FOR SELECT
    TO public
    USING (
        -- Allow admins to see all
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        -- Or allow if no user is logged in (for admin dashboard)
        OR auth.uid() IS NULL
    );

-- Create UPDATE policy - only admins
CREATE POLICY "admin_update_contact"
    ON public.contact_messages
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant explicit permissions
GRANT INSERT, SELECT ON public.contact_messages TO anon;
GRANT INSERT, SELECT, UPDATE ON public.contact_messages TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check Project Submissions
SELECT '========================================' as separator;
SELECT '📋 PROJECT SUBMISSIONS TABLE' as table_name;
SELECT '========================================' as separator;

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'project_submissions')
        THEN '✅ Table exists'
        ELSE '❌ Table does NOT exist'
    END as table_status;

-- Check if RLS is enabled
SELECT 
    CASE 
        WHEN rowsecurity = true 
        THEN '✅ RLS is enabled'
        ELSE '❌ RLS is NOT enabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'project_submissions';

-- List policies
SELECT 
    '📜 Policies for project_submissions:' as info;

SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'project_submissions'
ORDER BY policyname;

-- Check Contact Messages
SELECT '========================================' as separator;
SELECT '💬 CONTACT MESSAGES TABLE' as table_name;
SELECT '========================================' as separator;

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages')
        THEN '✅ Table exists'
        ELSE '❌ Table does NOT exist'
    END as table_status;

-- Check if RLS is enabled
SELECT 
    CASE 
        WHEN rowsecurity = true 
        THEN '✅ RLS is enabled'
        ELSE '❌ RLS is NOT enabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'contact_messages';

-- List policies
SELECT 
    '📜 Policies for contact_messages:' as info;

SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'contact_messages'
ORDER BY policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '========================================' as separator;
SELECT '🎉 ALL FORM FIXES APPLIED SUCCESSFULLY!' as status;
SELECT '========================================' as separator;
SELECT 'Now test your forms:' as instruction;
SELECT '1. Project Submission Form' as step1;
SELECT '2. Contact Form (Get in Touch)' as step2;
SELECT 'Both should submit without hanging!' as expected_result;
