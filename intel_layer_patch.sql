-- Phase 3: The Intelligence Layer — Profile Extensions
-- Adds persistence for adaptive learning levels and career roadmap progression

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_difficulty TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS roadmap_progress JSONB DEFAULT '{"node": 1, "unlocked": [1], "completed": []}',
ADD COLUMN IF NOT EXISTS skill_matrix JSONB DEFAULT '{"aptitude": 0, "logical": 0, "verbal": 0, "communication": 0, "interview": 0}',
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';

-- Update trigger or RPC function to handle auto-leveling in Phase 3
CREATE OR REPLACE FUNCTION update_user_level_from_scores()
RETURNS TRIGGER AS $$
DECLARE
    avg_score FLOAT;
BEGIN
    -- This function would be called after score insertions
    -- (Logic to be expanded as needed for server-side intelligence)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
