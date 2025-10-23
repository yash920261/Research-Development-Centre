-- Supabase Database Schema for R&D Center Website
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- This extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    department TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- FACULTY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    image TEXT DEFAULT '/placeholder.svg?height=300&width=300',
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    office TEXT NOT NULL,
    specialization TEXT[] NOT NULL DEFAULT '{}',
    experience TEXT NOT NULL,
    education TEXT NOT NULL,
    research_interests TEXT[] NOT NULL DEFAULT '{}',
    publications TEXT NOT NULL,
    projects TEXT[] NOT NULL DEFAULT '{}',
    web_profile JSONB DEFAULT '{
        "personal_statement": null,
        "website": null,
        "biography": null,
        "teaching_philosophy": null,
        "achievements": [],
        "collaboration_interests": null
    }'::jsonb,
    analytics JSONB DEFAULT '{
        "profile_views": 0,
        "contact_clicks": 0,
        "project_views": 0,
        "last_updated": null
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Policies for faculty
CREATE POLICY "Faculty profiles are viewable by everyone"
    ON public.faculty FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert faculty"
    ON public.faculty FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update faculty"
    ON public.faculty FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete faculty"
    ON public.faculty FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- FORUM TOPICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT DEFAULT '/placeholder.svg?height=40&width=40',
    author_department TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topics
CREATE POLICY "Forum topics are viewable by everyone"
    ON public.forum_topics FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create topics"
    ON public.forum_topics FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own topics"
    ON public.forum_topics FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own topics or admins can delete any"
    ON public.forum_topics FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- FORUM REPLIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT DEFAULT '/placeholder.svg?height=40&width=40',
    author_department TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Policies for forum_replies
CREATE POLICY "Forum replies are viewable by everyone"
    ON public.forum_replies FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create replies"
    ON public.forum_replies FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies"
    ON public.forum_replies FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies or admins can delete any"
    ON public.forum_replies FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- FORUM LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_like_target CHECK (
        (topic_id IS NOT NULL AND reply_id IS NULL) OR
        (topic_id IS NULL AND reply_id IS NOT NULL)
    ),
    CONSTRAINT unique_topic_like UNIQUE (user_id, topic_id),
    CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
);

-- Enable Row Level Security
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Policies for forum_likes
CREATE POLICY "Likes are viewable by everyone"
    ON public.forum_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create likes"
    ON public.forum_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
    ON public.forum_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- PROJECT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    project_title TEXT NOT NULL,
    project_description TEXT NOT NULL,
    resources TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for project_submissions
CREATE POLICY "Anyone can submit projects"
    ON public.project_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins can view all submissions"
    ON public.project_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Only admins can update submissions"
    ON public.project_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON public.faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_submissions_updated_at BEFORE UPDATE ON public.project_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_faculty_department ON public.faculty(department);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON public.faculty(email);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON public.forum_topics(category);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON public.forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON public.forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_topic ON public.forum_likes(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_reply ON public.forum_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON public.project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_project_submissions_email ON public.project_submissions(email);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
