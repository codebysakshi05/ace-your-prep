import { supabase } from '../lib/supabase';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

/**
 * Upgraded: looks at last 5 scores, has hysteresis to prevent thrashing
 */
export async function getAdaptiveDifficulty(userId: string, moduleType: string): Promise<Difficulty> {
  const tableName = moduleType === 'aptitude' ? 'aptitude_scores' : 
                   moduleType === 'interview' ? 'interview_scores' : 
                   moduleType === 'communication' ? 'communication_scores' : null;

  if (!tableName) return 'Beginner';

  const scoreField = moduleType === 'aptitude' ? 'score' 
                   : moduleType === 'communication' ? 'overall_score'
                   : 'evaluation_score';

  const { data } = await supabase
    .from(tableName)
    .select(scoreField)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5); // Upgraded: was 3

  if (!data || data.length < 2) return 'Intermediate';

  const scores = data.map((b: any) => b[scoreField] || 0);
  const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

  // Hysteresis: only go to Expert if consistently high (not just 1 fluke)
  const hasConsistentHigh = scores.slice(0, 3).filter(s => s >= 75).length >= 2;
  const hasConsistentLow = scores.slice(0, 3).filter((s: number) => s < 40).length >= 3;

  if (avg >= 75 && hasConsistentHigh) return 'Expert';
  if (avg <= 40 && hasConsistentLow) return 'Beginner';
  return 'Intermediate';
}

export function getXpForActivity(difficulty: Difficulty, score: number): number {
  const base = difficulty === 'Expert' ? 100 : difficulty === 'Intermediate' ? 60 : 30;
  const multiplier = score >= 90 ? 1.5 : score >= 75 ? 1.2 : score >= 50 ? 1.0 : 0.5;
  return Math.round(base * multiplier);
}

/**
 * Get the next difficulty tier label
 */
export function getNextDifficultyLabel(current: Difficulty): string {
  if (current === 'Beginner') return 'Advanced';
  if (current === 'Intermediate') return 'Expert';
  return 'Max Level Reached';
}

/**
 * Get progress percentage toward next level
 */
export function getDifficultyProgress(current: Difficulty): number {
  if (current === 'Beginner') return 33;
  if (current === 'Intermediate') return 66;
  return 100;
}
