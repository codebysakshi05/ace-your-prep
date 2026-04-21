-- Phase 3: Intelligence Layer Patch
-- Run this in your Supabase SQL Editor to enable persistent intelligence features.

-- 1. Add current_difficulty to profiles for persistent adaptive learning
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_difficulty TEXT DEFAULT 'Intermediate';

-- 2. Add roadmap_progress to track career nodes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS roadmap_progress INTEGER DEFAULT 1;

-- 3. Add skill_matrix for granular topic-level performance storage
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS skill_matrix JSONB DEFAULT '{
  "aptitude": {"logic": 0, "quants": 0, "verbal": 0},
  "interview": {"behavioral": 0, "technical": 0, "hr": 0},
  "communication": {"clarity": 0, "tone": 0, "vocabulary": 0}
}'::jsonb;

-- 4. Enable RLS for the new columns (already covered by existing policies usually, but good to check)
-- This ensures that users can update their own intelligence data.
-- No specific action needed if the main profiles table already has "Users can update own profile" policy.

COMMENT ON COLUMN profiles.current_difficulty IS 'Stores the current AI-calculated difficulty level for the user.';
COMMENT ON COLUMN profiles.roadmap_progress IS 'Numeric index of the users current node in the career roadmap.';
COMMENT ON COLUMN profiles.skill_matrix IS 'Granular topic-level performance data for the AI Recommendation Engine.';
