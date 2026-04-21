-- ============================================================
-- ACE IT UP — PRODUCTION READINESS PATCH
-- Fixes: RLS Recursion, Permission Gaps, and Schema Sync
-- =─────────────────────────────────────────────────────────────

-- 1. SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- Prevents infinite recursion in RLS policies by moving the 
-- role check outside of the policy's RLS scope.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. REWRITE PROFILES RLS POLICIES (Recursion Fix)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Base policy: Users can see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admin policy: Admins can see everyone (recursive-safe)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (check_is_admin());

-- 3. ENSURE SCORE TABLES HAVE INSERT PERMISSIONS
-- This fixes the "scores not updating" issue.
DO $$ 
BEGIN
    -- Aptitude
    DROP POLICY IF EXISTS "Users can insert own aptitude" ON public.aptitude_scores;
    CREATE POLICY "Users can insert own aptitude" ON public.aptitude_scores
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Interview
    DROP POLICY IF EXISTS "Users can insert own interview" ON public.interview_scores;
    CREATE POLICY "Users can insert own interview" ON public.interview_scores
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Communication
    DROP POLICY IF EXISTS "Users can insert own communication" ON public.communication_scores;
    CREATE POLICY "Users can insert own communication" ON public.communication_scores
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- GD
    DROP POLICY IF EXISTS "Users can insert own gd" ON public.gd_sessions;
    CREATE POLICY "Users can insert own gd" ON public.gd_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
END $$;

-- 4. SCHEMA SYNC (GD Scores)
-- Ensure gd_sessions has the score column used by the dashboard
ALTER TABLE public.gd_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- 5. SEEN QUESTIONS LOGIC RLS
-- Allows the app to track which questions a user has finished
DROP POLICY IF EXISTS "Users can manage seen questions" ON public.user_seen_questions;
CREATE POLICY "Users can manage seen questions" ON public.user_seen_questions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. RESOURCE ACCESSIBILITY
-- Ensure resources are public/authenticated viewable
DROP POLICY IF EXISTS "Anyone can view resources" ON public.platform_resources;
CREATE POLICY "Anyone can view resources" ON public.platform_resources
    FOR SELECT USING (true);
