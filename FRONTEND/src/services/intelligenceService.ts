import { databaseService } from './databaseService';

export interface Recommendation {
  id: string;
  type: 'practice' | 'review' | 'milestone';
  title: string;
  desc: string;
  priority: 'high' | 'medium' | 'low';
  path: string;
  icon: string;
}

export interface SkillMatrix {
  aptitude: number;
  communication: number;
  gd: number;
  interview: number;
  overall: number;
}

export const intelligenceService = {
  /**
   * Generates a list of smart recommendations based on user stats
   */
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    const stats = await databaseService.fetchUserStats(userId);
    const recs: Recommendation[] = [];

    // 1. Critical Weakness Check
    const modules = [
      { id: 'aptitude', name: 'Aptitude', score: stats.aptitude, path: '/aptitude' },
      { id: 'communication', name: 'Communication', score: stats.communication, path: '/communication' },
      { id: 'gd', name: 'Group Discussion', score: stats.gd, path: '/gd-practice' },
      { id: 'interview', name: 'Interview', score: stats.interview, path: '/interview' }
    ];

    const sorted = [...modules].sort((a, b) => a.score - b.score);
    const weakest = sorted[0];

    if (weakest.score < 50) {
      recs.push({
        id: 'critical-focus',
        type: 'practice',
        title: `Boost ${weakest.name}`,
        desc: `Your ${weakest.name} capability is currently at ${weakest.score}%. We recommend a focused sprint to reach at least 65%.`,
        priority: 'high',
        path: weakest.path,
        icon: 'AlertTriangle'
      });
    }

    // 2. Improvement Trend (Dummy logic for now, could be based on history)
    if (stats.aptitude > 70 && stats.interview < 60) {
      recs.push({
        id: 'balance-skill',
        type: 'review',
        title: 'Articulation Sync',
        desc: 'Your logic is sharp, but your interview ratings are trailing. Try a mock interview session today.',
        priority: 'medium',
        path: '/interview',
        icon: 'TrendingUp'
      });
    }

    // 3. Roadmap Milestone
    recs.push({
      id: 'next-milestone',
      type: 'milestone',
      title: 'Roadmap Progress',
      desc: 'You are 85% through the Candidate rank. Complete one more challenge to unlock the Pro track.',
      priority: 'low',
      path: '/roadmap',
      icon: 'Target'
    });

    return recs;
  },

  /**
   * Calculates the full skill matrix for radar charts
   */
  async getSkillMatrix(userId: string): Promise<SkillMatrix> {
    const stats = await databaseService.fetchUserStats(userId);
    const overall = Math.round(
      (stats.aptitude + stats.communication + stats.gd + stats.interview) / 4
    );

    return {
      ...stats,
      overall
    };
  },

  /**
   * Gets specific mentor feedback for a given module/score
   */
  getMentorFeedback(score: number, moduleName: string): { status: string; advice: string; color: string } {
    if (score >= 85) return {
      status: 'Elite Proficiency',
      advice: `Your ${moduleName} is exceptional. You are in the top 5% of candidates. Maintain this consistency for top-tier company screenings.`,
      color: 'emerald'
    };
    if (score >= 65) return {
      status: 'On Track',
      advice: `Steady progress. You have a solid grasp of ${moduleName}. Focus on speed and accuracy to push into the elite bracket.`,
      color: 'indigo'
    };
    return {
      status: 'Developing',
      advice: `It's early days. Focus on the core fundamentals of ${moduleName}. Don't worry about the timer, focus on getting the logic right first.`,
      color: 'rose'
    };
  }
};
