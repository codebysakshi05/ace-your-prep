import { supabase } from '../lib/supabase';

export interface AptitudeScore {
  user_id: string;
  topic: string;
  score: number;
  total_questions: number;
}

export interface GDSession {
  user_id: string;
  topic: string;
  duration_seconds: number;
  status: string;
  score?: number;
}

export interface InterviewScore {
  user_id: string;
  question_category: string;
  evaluation_score: number;
  feedback: string;
}

export interface CommunicationScore {
  user_id: string;
  prompt: string;
  fluency_rating: number;
  clarity_rating: number;
  confidence_rating: number;
  overall_score: number;
}

export const databaseService = {
  // --- Score Saving ---

  async saveAptitudeScore(score: AptitudeScore) {
    const { data, error } = await supabase
      .from('aptitude_scores')
      .insert([score])
      .select();
    
    if (error) {
      console.error('[saveAptitudeScore] DB error:', error);
      throw error;
    }
    
    await this.logActivity(score.user_id, 'APTITUDE_TEST', `Completed ${score.topic} test with ${score.score}% score`);
    await this.updateUserXP(score.user_id, 50);
    
    return data;
  },

  async saveGDSession(session: GDSession) {
    const { data, error } = await supabase
      .from('gd_sessions')
      .insert([session])
      .select();
    
    if (error) {
      console.error('[saveGDSession] DB error:', error);
      throw error;
    }
    
    await this.logActivity(session.user_id, 'GD_PRACTICE', `Practiced GD topic: ${session.topic.substring(0, 30)}...`);
    await this.updateUserXP(session.user_id, 30);
    
    return data;
  },

  async saveInterviewScore(score: InterviewScore) {
    const { data, error } = await supabase
      .from('interview_scores')
      .insert([score])
      .select();
    
    if (error) {
      console.error('[saveInterviewScore] DB error:', error);
      throw error;
    }
    
    await this.logActivity(score.user_id, 'INTERVIEW_SIM', `Answered ${score.question_category} question. Score: ${score.evaluation_score}%`);
    await this.updateUserXP(score.user_id, 40);
    
    return data;
  },

  async saveCommunicationScore(score: CommunicationScore) {
    const { data, error } = await supabase
      .from('communication_scores')
      .insert([score])
      .select();
    
    if (error) {
      console.error('[saveCommunicationScore] DB error:', error);
      throw error;
    }
    
    await this.logActivity(score.user_id, 'COMM_PRACTICE', `Self-rated ${score.overall_score}% for speech practice`);
    await this.updateUserXP(score.user_id, 35);
    
    return data;
  },

  // --- Intelligence Fetchers ---

  /**
   * Fetches performance aggregated by topic to find specific weak points
   */
  async fetchDetailedTopicAnalysis(user_id: string, module_type: 'aptitude' | 'interview') {
    const table = module_type === 'aptitude' ? 'aptitude_scores' : 'interview_scores';
    const topicField = module_type === 'aptitude' ? 'topic' : 'question_category';
    const scoreField = module_type === 'aptitude' ? 'score' : 'evaluation_score';

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    if (!data) return [];

    // Group by topic and calculate average
    const grouped: Record<string, { total: number; count: number }> = {};
    data.forEach((row: any) => {
      const topic = row[topicField];
      if (!grouped[topic]) grouped[topic] = { total: 0, count: 0 };
      const val = row.evaluation_score !== undefined ? row.evaluation_score : (row.score !== undefined ? row.score : 0);
      grouped[topic].total += val;
      grouped[topic].count += 1;
    });

    return Object.entries(grouped).map(([name, stats]) => ({
      name,
      average: Math.round(stats.total / stats.count),
      count: stats.count
    })).sort((a, b) => a.average - b.average);
  },

  // --- Activity Logging ---

  async logActivity(user_id: string, action_type: string, context: string) {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{ user_id, action_type, context }]);
    
    if (error) console.error('[logActivity] Error:', error.message);
  },

  // --- XP / Level Update ---
  // Uses a Supabase DB function (update_user_xp) for atomic update.
  // Falls back to a direct update if the function is unavailable.
  async updateUserXP(user_id: string, xpIncrease: number) {
    try {
      // Try the deployed SQL function first
      const { data, error } = await supabase.rpc('update_user_xp', {
        p_user_id: user_id,
        p_xp_gain: xpIncrease
      });

      if (error) throw error;

      if (data?.leveled_up) {
        window.dispatchEvent(new CustomEvent('user-level-up', { detail: { level: data.new_level } }));
      }
      if (data?.streak_updated) {
        window.dispatchEvent(new CustomEvent('user-streak-updated', { detail: { streak: data.new_streak } }));
      }

      return data;
    } catch (err) {
      // Fallback: direct XP increment if RPC not yet deployed
      console.warn('[updateUserXP] RPC failed, using direct update fallback:', err);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp, level')
          .eq('id', user_id)
          .single();

        if (profile) {
          const newXP = (profile.xp || 0) + xpIncrease;
          const newLevel = Math.max(1, Math.floor(newXP / 500) + 1);
          const leveledUp = newLevel > (profile.level || 1);

          await supabase
            .from('profiles')
            .update({ xp: newXP, level: newLevel })
            .eq('id', user_id);

          if (leveledUp) {
            window.dispatchEvent(new CustomEvent('user-level-up', { detail: { level: newLevel } }));
          }
        }
      } catch (fallbackErr) {
        console.error('[updateUserXP] Fallback also failed:', fallbackErr);
      }
      return { leveled_up: false, new_level: 1, streak_updated: false, new_streak: 0 };
    }
  },

  async fetchLeaderboard() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, level, xp, streak_count')
      .order('xp', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('[fetchLeaderboard]', error.message);
      return [];
    }
    return data || [];
  },

  async fetchUserAchievements(user_id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('achievements')
      .eq('id', user_id)
      .single();
    
    if (error) return [];
    return data?.achievements || [];
  },

  async grantAchievement(user_id: string, achievement: { id: string, name: string, icon: string }) {
    try {
      const current = await this.fetchUserAchievements(user_id);
      if (current.find((a: any) => a.id === achievement.id)) return; // already unlocked

      const updated = [...current, { ...achievement, unlocked_at: new Date().toISOString() }];
      
      const { error } = await supabase
        .from('profiles')
        .update({ achievements: updated })
        .eq('id', user_id);

      if (!error) {
        window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: achievement }));
      }
    } catch (err) {
      console.error('[grantAchievement]', err);
    }
  },

  async fetchPublicProfile(user_id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, level, xp, role, achievements, target_company, is_public')
        .eq('id', user_id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[fetchPublicProfile] Could not fetch:', err);
      return null;
    }
  },

  async fetchPublicActivity(user_id: string) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[fetchPublicActivity] Failed:', err);
      return [];
    }
  },

  async updateUserPrivacy(user_id: string, is_public: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_public })
      .eq('id', user_id);
    
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('ace-profile-updated'));
  },

  // --- Dashboard Data ---

  async fetchUserStats(user_id: string) {
    try {
      const fetchSafely = async (table: string) => {
        try {
          const { data, error } = await supabase.from(table).select('*').eq('user_id', user_id);
          if (error) {
            console.warn(`[fetchUserStats] Error fetching ${table}:`, error.message);
            return [];
          }
          return data || [];
        } catch (e) {
          console.warn(`[fetchUserStats] Exception fetching ${table}:`, e);
          return [];
        }
      };

      const [aptData, commData, gdData, intData] = await Promise.all([
        fetchSafely('aptitude_scores'),
        fetchSafely('communication_scores'),
        fetchSafely('gd_sessions'),
        fetchSafely('interview_scores'),
      ]);

      const calculateAvg = (data: any[], key: string, fallbackKey = 'score') =>
        data?.length ? Math.round(data.reduce((a, c) => a + (c[key] ?? c[fallbackKey] ?? 0), 0) / data.length) : 0;

      // GD score calculation
      const gdScores = (gdData || []).filter((s: any) => s.score > 0);
      const gdAvg = gdScores.length
        ? Math.round(gdScores.reduce((a, c) => a + (c.score || 0), 0) / gdScores.length)
        : 0;

      return {
        aptitude: calculateAvg(aptData, 'score'),
        communication: calculateAvg(commData, 'overall_score'),
        gd: gdAvg,
        interview: calculateAvg(intData, 'evaluation_score', 'score'),
      };
    } catch (err) {
      console.warn('[fetchUserStats] Global failure:', err);
      return { aptitude: 0, communication: 0, gd: 0, interview: 0 };
    }
  },

  async fetchWeeklyXP(user_id: string) {
    try {
      const days = 7;
      const now = new Date();
      const result = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date).setHours(0, 0, 0, 0);
        const dayEnd = new Date(date).setHours(23, 59, 59, 999);

        const { count } = await supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user_id)
          .gte('created_at', new Date(dayStart).toISOString())
          .lte('created_at', new Date(dayEnd).toISOString());

        result.push({
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          xp: (count || 0) * 40
        });
      }
      return result;
    } catch (err) {
      console.warn('[fetchWeeklyXP] Failed:', err);
      return [];
    }
  },

  async fetchResources() {
    try {
      const { data, error } = await supabase
        .from('platform_resources')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[fetchResources] Table missing or inaccessible:', err);
      return [];
    }
  },

  async fetchPerformanceInsights(user_id: string) {
    try {
      const stats = await this.fetchUserStats(user_id);
      
      const modules = [
        { id: 'Quants', name: 'Quantitative Aptitude', score: stats.aptitude, icon: 'Brain', route: '/aptitude' },
        { id: 'communication', name: 'Communication Practice', score: stats.communication, icon: 'MessageSquare', route: '/communication' },
        { id: 'gd', name: 'GD Simulator', score: stats.gd, icon: 'Users', route: '/gd-practice' },
        { id: 'interview', name: 'Interview Lab', score: stats.interview, icon: 'Video', route: '/interview' }
      ];

      // Sort by lowest score
      const sorted = [...modules].sort((a, b) => a.score - b.score);
      const weakest = sorted[0];

      // Logic for personalized mission text
      let recommendation = '';
      let missionTitle = '';

      if (weakest.score === 0) {
        missionTitle = `Start ${weakest.name} Training`;
        recommendation = `Target: Complete your first ${weakest.name} session to establish your starting level.`;
      } else if (weakest.score < 60) {
        missionTitle = `Improvement: ${weakest.name}`;
        recommendation = `Your current score in ${weakest.name} is ${weakest.score}%. Practice this area to improve your placement readiness.`;
      } else {
        missionTitle = `Refine Your Skills`;
        recommendation = `Current status: Excellent. Continue practicing ${weakest.name} to maintain your competitive edge.`;
      }

      return {
        weakest,
        missionTitle,
        recommendation
      };
    } catch (err) {
      return { 
        weakest: { id: 'Quants', name: 'Quantitative Aptitude', score: 0, icon: 'Brain', route: '/aptitude' },
        missionTitle: 'Start Practice Session',
        recommendation: 'Complete your first training session to see your performance analysis.'
      };
    }
  },

  // --- Seen Questions Logic ---

  async fetchSeenQuestionIds(user_id: string): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('user_seen_questions')
        .select('question_id')
        .eq('user_id', user_id);
      
      if (error) {
        console.warn('[fetchSeenQuestionIds] Table may not exist yet:', error.message);
        return [];
      }
      return (data || []).map(q => q.question_id);
    } catch (err) {
      console.warn('[fetchSeenQuestionIds] Resilience Triggered');
      return [];
    }
  },

  async markQuestionsAsSeen(user_id: string, question_ids: number[]) {
    if (!question_ids.length) return;
    try {
      const inserts = question_ids.map(id => ({ user_id, question_id: id }));
      const { error } = await supabase
        .from('user_seen_questions')
        .upsert(inserts, { onConflict: 'user_id,question_id' });
      
      if (error) console.warn('[markQuestionsAsSeen]', error.message);
    } catch (err) {
      console.warn('[markQuestionsAsSeen] Failed silently:', err);
    }
  },

  async updateTargetCompany(user_id: string, companyId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ target_company: companyId })
      .eq('id', user_id);
    
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('ace-profile-updated'));
  },

  async fetchAllPublicCandidates() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          level, 
          xp, 
          role, 
          achievements, 
          target_company, 
          is_public
        `)
        .eq('is_public', true)
        .order('xp', { ascending: false });

      if (error) throw error;

      // Fetch stats for each public user to facilitate matching
      const candidatesWithStats = await Promise.all((data || []).map(async (profile) => {
        const stats = await this.fetchUserStats(profile.id);
        return { ...profile, stats };
      }));

      return candidatesWithStats;
    } catch (err) {
      console.warn('[fetchAllPublicCandidates] Failed:', err);
      return [];
    }
  }
};
