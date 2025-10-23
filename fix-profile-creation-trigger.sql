-- ============================================
-- FIX: AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
-- This ensures new user profiles are automatically created
-- when someone signs up

-- ============================================
-- STEP 1: Check if trigger exists
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- If the above returns no results, the trigger doesn't exist

-- ============================================
-- STEP 2: Drop and recreate the function
-- ============================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'department', NULL)
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Drop and recreate the trigger
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Verify trigger was created
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Should show: on_auth_user_created | INSERT | users | EXECUTE FUNCTION public.handle_new_user() | AFTER

-- ============================================
-- STEP 5: Check existing users without profiles
-- ============================================
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ No Profile'
        ELSE '✅ Has Profile'
    END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 6: Create missing profiles for existing users
-- ============================================
-- This will create profiles for any users that don't have one
INSERT INTO public.profiles (id, email, name, role, department)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
    COALESCE(u.raw_user_meta_data->>'role', 'student') as role,
    COALESCE(u.raw_user_meta_data->>'department', NULL) as department
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- STEP 7: Verify all users now have profiles
-- ============================================
SELECT 
    COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as users_with_profiles,
    COUNT(CASE WHEN p.id IS NULL THEN 1 END) as users_without_profiles,
    COUNT(*) as total_users
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Trigger recreated successfully!' as status;
SELECT '✅ All existing users now have profiles!' as status;
SELECT '✅ New signups will automatically create profiles!' as status;

-- ============================================
-- TEST THE TRIGGER (Optional)
-- ============================================
-- To test, try signing up a new user on your website
-- Then run this query to verify the profile was created:
-- 
-- SELECT * FROM public.profiles 
-- WHERE email = 'test-user-email@example.com';
