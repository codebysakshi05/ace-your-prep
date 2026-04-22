import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Star, Trophy, ChevronRight } from 'lucide-react';
import type { Difficulty } from '../utils/adaptiveLearning';
import { getDifficultyProgress, getNextDifficultyLabel } from '../utils/adaptiveLearning';
import { getDifficultyLabel } from '../utils/questionEngine';

interface ProgressionBannerProps {
  difficulty: Difficulty;
  questionsAnswered: number;
  totalQuestions: number;
  currentScore: number;
  xpEarned: number;
  moduleColor?: string;
}

/**
 * Session progress banner shown during active practice
 */
export function SessionProgressBanner({
  difficulty,
  questionsAnswered,
  totalQuestions,
  currentScore,
  xpEarned,
  moduleColor = 'indigo'
}: ProgressionBannerProps) {
  const diffInfo = getDifficultyLabel(difficulty);
  const sessionProgress = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 flex flex-wrap items-center gap-8 shadow-xl mb-6"
    >
      {/* Difficulty Level */}
      <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl ${diffInfo.bg}`}>
        <Star className={`w-4 h-4 ${diffInfo.color}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest ${diffInfo.color}`}>
          {diffInfo.label} Level
        </span>
      </div>

      {/* Session Progress */}
      <div className="flex-grow min-w-[200px]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Progress</span>
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{questionsAnswered}/{totalQuestions}</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sessionProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full bg-${moduleColor}-500`}
            style={{ background: `var(--color-primary)` }}
          />
        </div>
      </div>

      {/* Live Score */}
      <div className="text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">{currentScore}%</p>
      </div>

      {/* XP Earned */}
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="text-sm font-black text-amber-600">+{xpEarned} XP</span>
      </div>
    </motion.div>
  );
}


interface LevelUpBannerProps {
  oldDifficulty: Difficulty;
  newDifficulty: Difficulty;
  onDismiss: () => void;
}

/**
 * Shown when the user's difficulty tier advances
 */
export function LevelUpBanner({ oldDifficulty, newDifficulty, onDismiss }: LevelUpBannerProps) {
  const newInfo = getDifficultyLabel(newDifficulty);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg px-6"
      >
        <div className="bg-slate-950 text-white rounded-3xl p-8 shadow-2xl shadow-black/50 border border-white/10 flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Difficulty Upgraded!</p>
            <h3 className="text-2xl font-black uppercase tracking-tighter">You've reached <span className={newInfo.color}>{newInfo.label}</span> Level!</h3>
            <p className="text-sm text-slate-400 mt-1">Your consistent performance has unlocked harder challenges.</p>
          </div>
          <button onClick={onDismiss} className="p-3 hover:bg-white/10 rounded-xl transition-all flex-shrink-0">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


interface StreakBadgeProps {
  streak: number;
}

/**
 * Small badge showing daily streak
 */
export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl">
      <span className="text-lg">🔥</span>
      <span className="text-xs font-black text-orange-600 uppercase tracking-widest">{streak} Day Streak</span>
    </div>
  );
}


interface DifficultyProgressProps {
  difficulty: Difficulty;
  recentAvg: number;
}

/**
 * Visual progress toward next difficulty tier
 */
export function DifficultyProgress({ difficulty, recentAvg }: DifficultyProgressProps) {
  const progress = getDifficultyProgress(difficulty);
  const nextLabel = getNextDifficultyLabel(difficulty);
  const diffInfo = getDifficultyLabel(difficulty);
  const toNextLevel = Math.max(0, 75 - recentAvg);

  return (
    <div className="glass-card p-8 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Level</p>
          <p className={`text-xl font-black uppercase ${diffInfo.color}`}>{diffInfo.label}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Level</p>
          <p className="text-xl font-black text-slate-500 uppercase">{nextLabel}</p>
        </div>
      </div>
      <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (recentAvg / 75) * 100)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
        />
      </div>
      {toNextLevel > 0 ? (
        <p className="text-xs text-slate-400 mt-3 font-medium">
          Score <span className="text-indigo-600 font-black">75%+ average</span> to unlock {nextLabel}
        </p>
      ) : (
        <p className="text-xs text-emerald-500 mt-3 font-black flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Ready to level up! Complete another session.
        </p>
      )}
    </div>
  );
}
