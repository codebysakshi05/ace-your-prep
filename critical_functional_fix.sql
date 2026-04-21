-- ============================================================
-- ACE IT UP — CRITICAL FUNCTIONAL FIX
-- This script fixes the "infinite recursion" RLS error and 
-- ensures all columns needed for Career Goals are present.
-- =─────────────────────────────────────────────────────────────

-- 1. FIX RLS RECURSION BY CREATING A SECURITY DEFINER FUNCTION
-- This allows checking the user's role without querying the 
-- profiles table recursively within the policy itself.
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

-- 2. REWRITE PROFILES RLS POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Base policy: Users can see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admin policy: Admins can see everyone (uses the non-recursive function)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (check_is_admin());

-- 3. ENSURE CAREER GOAL COLUMNS EXIST
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_company TEXT DEFAULT 'tcs';

-- Ensure GD score column exists (fixing the calculation bug)
ALTER TABLE public.gd_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- 4. FIX SCORE TABLES "INSERT" PERMISSION
-- Ensure users can actually save their practice results
DROP POLICY IF EXISTS "Users access own aptitude" ON public.aptitude_scores;
CREATE POLICY "Users access own aptitude" ON public.aptitude_scores
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own gd" ON public.gd_sessions;
CREATE POLICY "Users access own gd" ON public.gd_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own interview" ON public.interview_scores;
CREATE POLICY "Users access own interview" ON public.interview_scores
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own comm" ON public.communication_scores;
CREATE POLICY "Users access own comm" ON public.communication_scores
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. ENSURE EXPLANATIONS ARE SEEDED FOR BETTER "FUNCTIONAL" RUN
UPDATE public.module_questions 
SET explanation = 'Analyze the pattern carefully. Each step follows a logical increment or specific sequence defined in the question matrix.'
WHERE explanation IS NULL OR explanation = '';
