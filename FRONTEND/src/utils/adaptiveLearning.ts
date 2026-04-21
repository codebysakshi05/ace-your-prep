import { supabase } from '../lib/supabase';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export async function getAdaptiveDifficulty(userId: string, moduleType: string): Promise<Difficulty> {
  // Logic: Check last 3 scores for this module
  // If avg > 75 -> Expert
  // If avg < 45 -> Beginner
  // Else -> Intermediate

  const tableName = moduleType === 'aptitude' ? 'aptitude_scores' : 
                   moduleType === 'interview' ? 'interview_scores' : 
                   moduleType === 'communication' ? 'communication_scores' :
                   moduleType === 'gd' ? null : null;

  if (!tableName) return 'Beginner';

  // Map module type to its score column name
  const scoreField = moduleType === 'aptitude' ? 'score' 
                   : moduleType === 'communication' ? 'overall_score'
                   : 'evaluation_score';

  const { data } = await supabase
    .from(tableName)
    .select(scoreField)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!data || data.length < 2) return 'Intermediate';

  const avg = data.reduce((a, b: any) => a + (b[scoreField] || 0), 0) / data.length;

  if (avg >= 75) return 'Expert';
  if (avg <= 45) return 'Beginner';
  return 'Intermediate';
}

export function getXpForActivity(difficulty: Difficulty, score: number): number {
  const multiplier = difficulty === 'Expert' ? 1.5 : difficulty === 'Intermediate' ? 1 : 0.5;
  return Math.round(score * multiplier);
}
