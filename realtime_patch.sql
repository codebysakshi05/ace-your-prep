-- ACE IT UP: Supabase Realtime Activation Patch
-- This SQL activates Realtime functionality.

-- Enable real-time replication on the `profiles` table
-- This allows the Leaderboard to subscribe to changes automatically.
alter publication supabase_realtime add table profiles;

-- (Optional) If you want activity logs or scores to be real-time trackable later
-- alter publication supabase_realtime add table activity_logs;
-- alter publication supabase_realtime add table aptitude_scores;
