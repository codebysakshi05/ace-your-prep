/**
 * Smart Question Engine
 * - Zero repetition within a session
 * - Tracks seen questions across all sessions via Supabase
 * - Auto-selects appropriate difficulty tier based on user history
 * - Smart pool reset: when pool exhausted, resets only oldest 50% of seen Qs
 */

import { supabase } from '../lib/supabase';
import { databaseService } from '../services/databaseService';
import type { Difficulty } from './adaptiveLearning';

export interface Question {
  id: number;
  question_text: string;
  options?: string[];
  correct_answer?: number;
  category: string;
  difficulty: Difficulty;
  module_type: string;
  explanation?: string;
}

export interface QuestionEngineResult {
  questions: Question[];
  difficulty: Difficulty;
  totalAvailable: number;
  seenCount: number;
  isReset: boolean;
}

/**
 * Core function: Fetch fresh, non-repeated questions for a module
 */
export async function fetchSmartQuestions(
  userId: string,
  moduleType: string,
  difficulty: Difficulty,
  limit: number = 10,
  category?: string
): Promise<QuestionEngineResult> {
  
  // Step 1: Fetch all questions for this module
  let query = supabase
    .from('module_questions')
    .select('*')
    .eq('module_type', moduleType);
  
  if (category && category !== 'MOCK') {
    query = query.eq('category', category);
  }

  const { data: allQuestions, error } = await query;
  if (error) throw error;
  if (!allQuestions || allQuestions.length === 0) return {
    questions: [],
    difficulty,
    totalAvailable: 0,
    seenCount: 0,
    isReset: false
  };

  // Step 2: Get seen question IDs
  const seenIds = await databaseService.fetchSeenQuestionIds(userId);
  const seenCount = allQuestions.filter(q => seenIds.includes(q.id)).length;

  // Step 3: Filter by difficulty + unseen
  let pool = allQuestions.filter(q => 
    q.difficulty === difficulty && !seenIds.includes(q.id)
  );

  // Step 4: Fallback chain if pool too small
  let isReset = false;

  if (pool.length < Math.min(limit, 3)) {
    // Try any unseen question regardless of difficulty
    pool = allQuestions.filter(q => !seenIds.includes(q.id));
  }

  if (pool.length < Math.min(limit, 2)) {
    // Smart reset: remove oldest 50% of seen questions and retry
    await smartResetOldSeenQuestions(userId, seenIds, Math.floor(seenIds.length / 2));
    const refreshedSeenIds = await databaseService.fetchSeenQuestionIds(userId);
    pool = allQuestions.filter(q => 
      q.difficulty === difficulty && !refreshedSeenIds.includes(q.id)
    );
    if (pool.length === 0) pool = allQuestions.filter(q => !refreshedSeenIds.includes(q.id));
    isReset = true;
  }

  if (pool.length === 0) {
    // Last resort: use all questions (show a notice)
    pool = allQuestions.filter(q => q.difficulty === difficulty);
    if (pool.length === 0) pool = allQuestions;
    isReset = true;
  }

  // Step 5: Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, limit);

  return {
    questions: shuffled,
    difficulty,
    totalAvailable: allQuestions.length,
    seenCount,
    isReset
  };
}

/**
 * Smart reset: deletes only the oldest N seen question records (not all)
 */
async function smartResetOldSeenQuestions(
  userId: string,
  seenIds: number[],
  resetCount: number
): Promise<void> {
  if (!seenIds.length || resetCount <= 0) return;
  
  try {
    // Fetch with timestamps to find oldest
    const { data } = await supabase
      .from('user_seen_questions')
      .select('id, question_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(resetCount);

    if (!data?.length) return;

    const idsToDelete = data.map(r => r.id);
    await supabase
      .from('user_seen_questions')
      .delete()
      .in('id', idsToDelete);
  } catch (err) {
    console.warn('[questionEngine] Smart reset failed silently:', err);
  }
}

/**
 * Calculate XP reward based on difficulty and score
 */
export function calculateXP(difficulty: Difficulty, score: number): number {
  const base = difficulty === 'Expert' ? 100 : difficulty === 'Intermediate' ? 60 : 30;
  const bonus = score >= 90 ? 1.5 : score >= 75 ? 1.2 : score >= 50 ? 1.0 : 0.5;
  return Math.round(base * bonus);
}

/**
 * Get a user-friendly label for current difficulty level
 */
export function getDifficultyLabel(difficulty: Difficulty): {
  label: string;
  color: string;
  bg: string;
  next: string;
  progress: number;
} {
  switch (difficulty) {
    case 'Beginner':
      return { label: 'Foundation', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', next: 'Intermediate', progress: 33 };
    case 'Intermediate':
      return { label: 'Advanced', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', next: 'Expert', progress: 66 };
    case 'Expert':
      return { label: 'Expert', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', next: 'Max', progress: 100 };
  }
}

/**
 * Determine if user should level up difficulty based on recent scores
 */
export function shouldLevelUp(recentScores: number[], threshold = 75): boolean {
  if (recentScores.length < 2) return false;
  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  return avg >= threshold;
}

/**
 * Determine if user should level down (struggling consistently)
 */
export function shouldLevelDown(recentScores: number[], threshold = 40): boolean {
  if (recentScores.length < 3) return false;
  const allLow = recentScores.slice(-3).every(s => s < threshold);
  return allLow;
}
