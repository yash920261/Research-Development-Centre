-- ============================================
-- CHANGE USER ROLE TO ADMIN
-- ============================================
-- Use this script to promote a user to admin role

-- METHOD 1: By Email
-- Replace 'user@example.com' with the actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE';

-- METHOD 2: By User ID
-- Uncomment and replace with actual UUID
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'USER_UUID_HERE';

-- ============================================
-- VERIFY THE CHANGE
-- ============================================
SELECT 
    id,
    email,
    name,
    role,
    department,
    created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- OPTIONAL: List all users and their roles
-- ============================================
SELECT 
    email,
    name,
    role,
    department,
    CASE 
        WHEN role = 'admin' THEN '👑 Admin'
        WHEN role = 'student' THEN '🎓 Student'
        ELSE '❓ Unknown'
    END as role_display
FROM public.profiles
ORDER BY role, email;

-- ============================================
-- NOTES
-- ============================================
-- Valid roles: 'student' or 'admin'
-- After changing role, user needs to:
-- 1. Log out
-- 2. Log back in
-- 3. Analytics link will appear in header
-- 4. Admin dashboard will be accessible
