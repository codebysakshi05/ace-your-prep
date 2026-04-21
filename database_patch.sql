-- 1. Create Missing Score and Session Tables
CREATE TABLE IF NOT EXISTS public.aptitude_scores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic text NOT NULL,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interview_scores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_category text NOT NULL,
    evaluation_score integer NOT NULL,
    feedback text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_scores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    fluency_rating integer,
    clarity_rating integer,
    confidence_rating integer,
    overall_score integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gd_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic text NOT NULL,
    duration_seconds integer,
    status text DEFAULT 'completed',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type text NOT NULL,
    context text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.aptitude_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Users manage own data)
CREATE POLICY "Users can manage own aptitude scores" ON public.aptitude_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own interview scores" ON public.interview_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own communication scores" ON public.communication_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own gd sessions" ON public.gd_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activity logs" ON public.activity_logs FOR ALL USING (auth.uid() = user_id);

-- 4. Setup Gamification Triggers
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS trigger AS $$
DECLARE
    points_to_add integer := 0;
BEGIN
    IF TG_TABLE_NAME = 'aptitude_scores' THEN
        points_to_add := NEW.score * 5;
    ELSIF TG_TABLE_NAME = 'interview_scores' THEN
        points_to_add := NEW.evaluation_score * 10;
    ELSIF TG_TABLE_NAME = 'communication_scores' THEN
        points_to_add := NEW.overall_score * 8;
    ELSIF TG_TABLE_NAME = 'gd_sessions' THEN
        points_to_add := 50; -- Base points for a GD session
    END IF;

    UPDATE public.profiles 
    SET 
        xp = xp + points_to_add,
        total_score = total_score + points_to_add,
        level = FLOOR(SQRT((xp + points_to_add) / 100)) + 1,
        last_active_date = CURRENT_DATE
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS on_aptitude_score_inserted ON public.aptitude_scores;
DROP TRIGGER IF EXISTS on_interview_score_inserted ON public.interview_scores;
DROP TRIGGER IF EXISTS on_communication_score_inserted ON public.communication_scores;
DROP TRIGGER IF EXISTS on_gd_session_inserted ON public.gd_sessions;

-- Create Triggers
CREATE TRIGGER on_aptitude_score_inserted 
    AFTER INSERT ON public.aptitude_scores 
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

CREATE TRIGGER on_interview_score_inserted 
    AFTER INSERT ON public.interview_scores 
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

CREATE TRIGGER on_communication_score_inserted 
    AFTER INSERT ON public.communication_scores 
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

CREATE TRIGGER on_gd_session_inserted 
    AFTER INSERT ON public.gd_sessions 
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();
