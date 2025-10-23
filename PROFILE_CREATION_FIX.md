# Profile Creation Issue - Troubleshooting Guide

## Problem
When a new user signs up, their profile is not being created in the `profiles` table in Supabase.

## Root Cause
The database trigger `on_auth_user_created` that should automatically create a profile entry when a new user signs up is either:
1. Not created in the Supabase instance
2. Not working properly
3. Has an error preventing profile creation

## Solution

### Quick Fix (Run SQL Script)

**Run [`fix-profile-creation-trigger.sql`](d:\YASH\DTI PROJECT\RDC_WEBSITE\fix-profile-creation-trigger.sql) in Supabase SQL Editor**

This script will:
1. ✅ Check if trigger exists
2. ✅ Recreate the trigger function with error handling
3. ✅ Recreate the trigger
4. ✅ Create profiles for any existing users without them
5. ✅ Verify everything is working

### Step-by-Step Manual Fix

#### 1. Open Supabase SQL Editor
- Go to: https://tvbgytfvkayvghomzuzb.supabase.co
- Click **SQL Editor** in left sidebar

#### 2. Check if Trigger Exists
```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Expected Result:** Should show `on_auth_user_created | INSERT | users`  
**If empty:** Trigger doesn't exist (proceed to step 3)

#### 3. Create the Trigger Function
```sql
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
        -- Profile already exists
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log but don't fail
        RAISE WARNING 'Failed to create profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 4. Create the Trigger
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

#### 5. Fix Existing Users
Check if any users don't have profiles:
```sql
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE WHEN p.id IS NULL THEN '❌ Missing' ELSE '✅ Exists' END as profile
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
```

If any show "❌ Missing", create their profiles:
```sql
INSERT INTO public.profiles (id, email, name, role, department)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    COALESCE(u.raw_user_meta_data->>'role', 'student'),
    COALESCE(u.raw_user_meta_data->>'department', NULL)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## Testing

### 1. Test New Signup
1. Go to your website
2. Try signing up with a test account:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Name: `Test User`
   - Role: Student
   - Department: Computer Science

3. Check if profile was created:
```sql
SELECT * FROM public.profiles 
WHERE email = 'test@example.com';
```

**Expected:** Should return 1 row with all user data

### 2. Test Login After Signup
1. Log out (if logged in)
2. Log in with the test account
3. Should successfully load the profile

## Common Issues & Solutions

### Issue 1: Trigger Exists But Doesn't Fire
**Cause:** Trigger function has an error  
**Solution:** Drop and recreate with error handling (see script above)

### Issue 2: Profile Created But Fields Are NULL
**Cause:** Metadata not being passed during signup  
**Check:** Auth-context signup function includes options.data  
**Verify:** 
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,     // ✅ Must be here
      role,     // ✅ Must be here
      department, // ✅ Optional
    },
  },
})
```

### Issue 3: Permission Denied
**Cause:** RLS policies block INSERT  
**Solution:** Profile INSERT policy allows user to create their own:
```sql
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
```

### Issue 4: Email Already Exists Error
**Cause:** Trying to create duplicate profile  
**Solution:** Trigger function now handles this with `EXCEPTION WHEN unique_violation`

## Verification Checklist

After running the fix, verify:

- [ ] Trigger `on_auth_user_created` exists in `information_schema.triggers`
- [ ] Function `handle_new_user()` exists and has no syntax errors
- [ ] All existing users in `auth.users` have corresponding entries in `profiles`
- [ ] New signup creates a profile automatically
- [ ] Login after signup works (profile loads correctly)
- [ ] User can see their name in the header after login

## Prevention

To prevent this issue in the future:
1. Always run the complete `supabase-schema.sql` when setting up
2. Verify triggers are created after running schema
3. Test signup immediately after database setup
4. Monitor Supabase logs for trigger errors

## Related Files
- [`supabase-schema.sql`](d:\YASH\DTI PROJECT\RDC_WEBSITE\supabase-schema.sql) - Complete schema with trigger
- [`contexts/auth-context.tsx`](d:\YASH\DTI PROJECT\RDC_WEBSITE\contexts\auth-context.tsx) - Signup logic
- [`fix-profile-creation-trigger.sql`](d:\YASH\DTI PROJECT\RDC_WEBSITE\fix-profile-creation-trigger.sql) - Fix script

## Still Not Working?

If the issue persists after running the fix:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Database → Logs
   - Look for errors related to trigger execution

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for signup errors
   - Check if signup API call succeeds

3. **Manually Create Profile:**
   ```sql
   INSERT INTO public.profiles (id, email, name, role)
   VALUES (
       'user-uuid-from-auth-users',
       'user@example.com',
       'User Name',
       'student'
   );
   ```

4. **Contact for Help:**
   - Share error messages from Supabase logs
   - Share browser console errors
   - Share output of diagnostic queries
