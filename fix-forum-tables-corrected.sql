-- CORRECTED FIX FOR ALL FORUM TABLES (with proper UUID handling)
-- ============================================
-- Run this in Supabase SQL Editor

-- ============================================
-- FORUM TOPICS
-- ============================================
-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.forum_topics;
DROP POLICY IF EXISTS "Forum topics are viewable by everyone" ON public.forum_topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Users can update their own topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Users can delete their own topics or admins can delete any" ON public.forum_topics;
DROP POLICY IF EXISTS "public_insert_forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "public_select_forum_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "users_update_own_topics" ON public.forum_topics;
DROP POLICY IF EXISTS "users_delete_own_topics" ON public.forum_topics;

-- Create new permissive policies (CORRECTED - no type casting)
CREATE POLICY "public_insert_forum_topics"
    ON public.forum_topics
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "public_select_forum_topics"
    ON public.forum_topics
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "users_update_own_topics"
    ON public.forum_topics
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid());  -- Both are UUID, no casting needed

CREATE POLICY "users_delete_own_topics"
    ON public.forum_topics
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());  -- Both are UUID, no casting needed

-- Grant permissions
GRANT INSERT, SELECT ON public.forum_topics TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.forum_topics TO authenticated;

-- ============================================
-- FORUM REPLIES
-- ============================================
-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.forum_replies;
DROP POLICY IF EXISTS "Forum replies are viewable by everyone" ON public.forum_replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON public.forum_replies;
DROP POLICY IF EXISTS "Users can delete their own replies or admins can delete any" ON public.forum_replies;
DROP POLICY IF EXISTS "public_insert_forum_replies" ON public.forum_replies;
DROP POLICY IF EXISTS "public_select_forum_replies" ON public.forum_replies;
DROP POLICY IF EXISTS "users_update_own_replies" ON public.forum_replies;
DROP POLICY IF EXISTS "users_delete_own_replies" ON public.forum_replies;

-- Create new permissive policies (CORRECTED - no type casting)
CREATE POLICY "public_insert_forum_replies"
    ON public.forum_replies
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "public_select_forum_replies"
    ON public.forum_replies
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "users_update_own_replies"
    ON public.forum_replies
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid());  -- Both are UUID, no casting needed

CREATE POLICY "users_delete_own_replies"
    ON public.forum_replies
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());  -- Both are UUID, no casting needed

-- Grant permissions
GRANT INSERT, SELECT ON public.forum_replies TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.forum_replies TO authenticated;

-- ============================================
-- FORUM LIKES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.forum_likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.forum_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.forum_likes;
DROP POLICY IF EXISTS "public_insert_forum_likes" ON public.forum_likes;
DROP POLICY IF EXISTS "public_select_forum_likes" ON public.forum_likes;
DROP POLICY IF EXISTS "users_delete_own_likes" ON public.forum_likes;

-- Create new policies (CORRECTED - no type casting)
CREATE POLICY "public_insert_forum_likes"
    ON public.forum_likes
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "public_select_forum_likes"
    ON public.forum_likes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "users_delete_own_likes"
    ON public.forum_likes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());  -- Both are UUID, no casting needed

-- Grant permissions
GRANT INSERT, SELECT ON public.forum_likes TO anon;
GRANT INSERT, SELECT, DELETE ON public.forum_likes TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '✅ Forum topics policies fixed' as status;
SELECT '✅ Forum replies policies fixed' as status;
SELECT '✅ Forum likes policies fixed' as status;

-- Show all policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('forum_topics', 'forum_replies', 'forum_likes')
ORDER BY tablename, policyname;
