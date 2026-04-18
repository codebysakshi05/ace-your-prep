-- Add behavior analytics columns to attempts
ALTER TABLE public.attempts
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS time_spent_ms INTEGER;

CREATE INDEX IF NOT EXISTS idx_attempts_user_module_created
  ON public.attempts (user_id, module, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempts_user_topic
  ON public.attempts (user_id, module, topic);