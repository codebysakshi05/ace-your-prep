-- 1. Add user_seen_questions to prevent repetition
CREATE TABLE IF NOT EXISTS public.user_seen_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id bigint NOT NULL REFERENCES public.module_questions(id) ON DELETE CASCADE,
    last_seen timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, question_id)
);

-- 2. Add RLS for user_seen_questions
ALTER TABLE public.user_seen_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own seen questions" ON public.user_seen_questions;
CREATE POLICY "Users can manage own seen questions" ON public.user_seen_questions FOR ALL USING (auth.uid() = user_id);

-- 3. Enhance module_questions with company and tags metadata
ALTER TABLE public.module_questions ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.module_questions ADD COLUMN IF NOT EXISTS tags text[];

-- 4. Initial Seed for Company-based Questions
UPDATE public.module_questions SET company = 'Google', tags = ARRAY['algorithm', 'logic'] WHERE category = 'Logical' AND question_text ILIKE '%Bloops%';
UPDATE public.module_questions SET company = 'TCS', tags = ARRAY['math', 'basics'] WHERE category = 'Quants' AND question_text ILIKE '%15% of 200%';
UPDATE public.module_questions SET company = 'Infosys', tags = ARRAY['communication', 'verbal'] WHERE category = 'Verbal' AND question_text ILIKE '%Abundant%';
