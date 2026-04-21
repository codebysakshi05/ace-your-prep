-- Ace It Up: Phase 15 RLS Updates (Public Portfolio)

-- 1. Profiles Table (Only allow reads, maintain ID check for inserts/updates)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- 2. Aptitude Scores
DROP POLICY IF EXISTS "Users access own aptitude" ON public.aptitude_scores;
CREATE POLICY "Public aptitude scores are viewable" ON public.aptitude_scores FOR SELECT USING (true);
CREATE POLICY "Users insert/update own aptitude" ON public.aptitude_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own aptitude" ON public.aptitude_scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users update own aptitude" ON public.aptitude_scores FOR UPDATE USING (auth.uid() = user_id);

-- 3. GD Sessions
DROP POLICY IF EXISTS "Users access own gd" ON public.gd_sessions;
CREATE POLICY "Public gd scores are viewable" ON public.gd_sessions FOR SELECT USING (true);
CREATE POLICY "Users insert/update own gd" ON public.gd_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own gd" ON public.gd_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users update own gd" ON public.gd_sessions FOR UPDATE USING (auth.uid() = user_id);

-- 4. Interview Scores
DROP POLICY IF EXISTS "Users access own interview" ON public.interview_scores;
CREATE POLICY "Public interview scores viewable" ON public.interview_scores FOR SELECT USING (true);
CREATE POLICY "Users insert/update own interview" ON public.interview_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own interview" ON public.interview_scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users update own interview" ON public.interview_scores FOR UPDATE USING (auth.uid() = user_id);

-- 5. Communication Scores
DROP POLICY IF EXISTS "Users access own comm" ON public.communication_scores;
CREATE POLICY "Public comms scores viewable" ON public.communication_scores FOR SELECT USING (true);
CREATE POLICY "Users insert/update own comm" ON public.communication_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comm" ON public.communication_scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users update own comm" ON public.communication_scores FOR UPDATE USING (auth.uid() = user_id);

-- 6. Re-assert existing "FOR ALL" policies were deleted above, so we explicitly define INSERT/UPDATE/DELETE.
-- Note: Previously we had a catch-all "FOR ALL USING (auth.uid() = user_id)"
-- We have replaced them with explicit specific policies above maintaining security.
