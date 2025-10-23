-- ============================================
-- DIAGNOSTIC: Check for triggers and functions
-- ============================================
-- This will help us find what's modifying policies after submissions

-- 1. Check for triggers on project_submissions
SELECT 
    '📋 TRIGGERS ON project_submissions:' as info;
    
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'project_submissions'
ORDER BY trigger_name;

-- 2. Check for triggers on contact_messages
SELECT 
    '📋 TRIGGERS ON contact_messages:' as info;
    
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'contact_messages'
ORDER BY trigger_name;

-- 3. Check current RLS policies
SELECT 
    '========================================' as separator;
SELECT 
    '🔒 CURRENT RLS POLICIES' as info;
SELECT 
    '========================================' as separator;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('project_submissions', 'contact_messages')
ORDER BY tablename, policyname;

-- 4. Check table permissions
SELECT 
    '========================================' as separator;
SELECT 
    '👥 TABLE PERMISSIONS' as info;
SELECT 
    '========================================' as separator;

SELECT 
    grantee,
    table_schema,
    table_name,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_name IN ('project_submissions', 'contact_messages')
    AND table_schema = 'public'
GROUP BY grantee, table_schema, table_name
ORDER BY table_name, grantee;

-- 5. Check if RLS is enabled
SELECT 
    '========================================' as separator;
SELECT 
    '🔐 RLS STATUS' as info;
SELECT 
    '========================================' as separator;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('project_submissions', 'contact_messages')
    AND schemaname = 'public';
