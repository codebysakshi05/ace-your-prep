-- Add target_company column to profiles to store user's career ambition
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_company TEXT DEFAULT 'tcs';

-- Trigger a refresh for existing users to have a default goal
UPDATE public.profiles 
SET target_company = 'tcs' 
WHERE target_company IS NULL;
