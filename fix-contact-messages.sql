-- ============================================
-- COMPLETE FIX FOR CONTACT MESSAGES TABLE
-- ============================================
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing table and policies (clean slate)
DROP TABLE IF EXISTS public.contact_messages CASCADE;

-- Step 2: Create the table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create INSERT policy - ALLOW EVERYONE
CREATE POLICY "allow_public_insert_contact"
    ON public.contact_messages
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Step 5: Create SELECT policy - Allow everyone (or restrict to admins only)
CREATE POLICY "allow_public_select_contact"
    ON public.contact_messages
    FOR SELECT
    TO public
    USING (true);

-- Step 6: Create UPDATE policy - Only admins
CREATE POLICY "allow_admin_update_contact"
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

-- Step 7: Grant permissions explicitly
GRANT INSERT, SELECT ON public.contact_messages TO anon;
GRANT INSERT, SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- Step 8: Create updated_at trigger
CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create indexes
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_messages'
    ) THEN
        RAISE NOTICE '✅ Table contact_messages exists';
    ELSE
        RAISE NOTICE '❌ Table contact_messages does NOT exist';
    END IF;
END
$$;

-- Check RLS is enabled
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'contact_messages'
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS is enabled';
    ELSE
        RAISE NOTICE '❌ RLS is NOT enabled';
    END IF;
END
$$;

-- List all policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'contact_messages';

-- Test insert (optional - remove if you don't want test data)
-- INSERT INTO public.contact_messages (name, email, inquiry_type, message)
-- VALUES ('Test User', 'test@example.com', 'general', 'This is a test message');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '🎉 Contact messages table is ready!' as status;
