import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Brain, Target, Timer, Trophy, Zap, Shield, CheckCircle, XCircle, RotateCcw,
  ArrowRight, TrendingUp, Sparkles, Activity, HelpCircle, Star, ChevronRight, Flame
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { getAdaptiveDifficulty, type Difficulty } from '../../utils/adaptiveLearning';
import { databaseService } from '../../services/databaseService';
import { fetchSmartQuestions, getDifficultyLabel, calculateXP } from '../../utils/questionEngine';
import { PlacementTips } from '../../components/PlacementTips';
import { LevelUpBanner, StreakBadge } from '../../components/ProgressionSystem';
import confetti from 'canvas-confetti';

const TOPICS = [
  { id: 'Quants', name: 'Quantitative Aptitude', desc: 'Numbers, algebra & geometry.', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'Logical', name: 'Logical Reasoning', desc: 'Puzzles, sequences & logic.', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'Verbal', name: 'Verbal Ability', desc: 'Grammar, vocabulary & reading.', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'MOCK', name: 'Full Mock Test', desc: 'Random mix of all categories.', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' }
];

export function Aptitude() {
  const { user, refreshProfile, profile } = useAuth();
  const location = useLocation();
  const sessionType = location.state?.sessionType || null;

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [showResult, setShowResult] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Intermediate');
  const [xpEarned, setXpEarned] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevDifficulty, setPrevDifficulty] = useState<Difficulty>('Intermediate');
  const [isReset, setIsReset] = useState(false);
  const answeredCorrect = useRef(0);

  // Timer
  useEffect(() => {
    let timer: any = null;
    if (selectedTopic && !showResult && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); submitQuiz(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedTopic, showResult, timeLeft]);

  // Auto-start from PracticeHub
  useEffect(() => {
    const focusTopic = location.state?.focusTopic;
    if (focusTopic && user?.id) startQuiz(focusTopic);
  }, [location.state, user]);

  const startQuiz = async (topicId: string) => {
    try {
      setIsLoading(true);
      const isWeaknessFocus = location.state?.isMission || false;
      if (isWeaknessFocus) toast.success(`Targeting weak area: ${topicId}`, { icon: '🎯' });

      let targetTopic = topicId;
      if (sessionType === 'focus' && user?.id) {
        const insights = await databaseService.fetchPerformanceInsights(user.id);
        if (insights?.weakest?.id) targetTopic = 'MOCK';
      }

      const difficulty = await getAdaptiveDifficulty(user?.id || '', 'aptitude');
      if (sessionType === 'challenge') {
        // Force Expert for challenge mode
      }
      const finalDifficulty: Difficulty = sessionType === 'challenge' ? 'Expert' : difficulty;
      setCurrentDifficulty(finalDifficulty);
      setPrevDifficulty(finalDifficulty);

      const limit = sessionType === 'quick' ? 5 : sessionType === 'sprint' ? 15 : sessionType === 'challenge' ? 20 : 10;
      const duration = sessionType === 'quick' ? 300 : sessionType === 'sprint' ? 900 : sessionType === 'challenge' ? 1200 : 600;

      const result = await fetchSmartQuestions(
        user?.id || '',
        'aptitude',
        finalDifficulty,
        limit,
        targetTopic !== 'MOCK' ? targetTopic : undefined
      );

      if (result.isReset) {
        toast('🔄 You\'ve mastered this set! Starting a fresh challenge.', { icon: '🏆', duration: 4000 });
      }

      if (result.questions.length > 0) {
        setQuestions(result.questions);
        setSelectedTopic(targetTopic);
        setCurrentIdx(0);
        setScore(0);
        scoreRef.current = 0;
        answeredCorrect.current = 0;
        setShowResult(false);
        setSelectedOpt(null);
        setHasAnswered(false);
        setTimeLeft(duration);
        setXpEarned(0);
        setIsReset(result.isReset);
      } else {
        toast.error('No questions available. Try a different category.');
      }
    } catch (err: any) {
      toast.error('Could not load questions. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    if (hasAnswered || !selectedTopic) return;
    setSelectedOpt(index);
    setHasAnswered(true);
    const isCorrect = index === Number(questions[currentIdx].correct_answer);
    questions[currentIdx].user_answer = index;
    if (isCorrect) {
      scoreRef.current += 1;
      answeredCorrect.current += 1;
      setScore(scoreRef.current);
      toast.success('Correct! +1', { duration: 600 });
    } else {
      toast.error('Incorrect', { duration: 600 });
    }
  };

  const submitQuiz = async (isTimeout = false) => {
    setShowResult(true);
    if (!user?.id || !selectedTopic) return;

    const percentage = Math.round((scoreRef.current / questions.length) * 100);
    const xp = calculateXP(currentDifficulty, percentage);
    setXpEarned(xp);

    if (percentage >= 80) confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });

    try {
      await databaseService.saveAptitudeScore({ user_id: user.id, topic: selectedTopic, score: percentage, total_questions: questions.length });
      await databaseService.markQuestionsAsSeen(user.id, questions.map(q => q.id));
      await refreshProfile();
      window.dispatchEvent(new CustomEvent('ace-score-updated'));

      // Check if difficulty should upgrade
      const newDifficulty = await getAdaptiveDifficulty(user.id, 'aptitude');
      if (newDifficulty !== currentDifficulty && newDifficulty !== 'Beginner') {
        setPrevDifficulty(currentDifficulty);
        setCurrentDifficulty(newDifficulty);
        setTimeout(() => setShowLevelUp(true), 800);
      }
    } catch (err) {
      console.error('Score saving failed:', err);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setHasAnswered(false);
    } else {
      submitQuiz();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const diffInfo = getDifficultyLabel(currentDifficulty);

  // ── TOPIC SELECTION SCREEN ──
  if (!selectedTopic || questions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 pb-20 pt-6 px-6 animate-fade-in">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="badge-premium bg-primary/10 text-primary border-primary/20 inline-block">
              Aptitude Training
            </div>
            <StreakBadge streak={profile?.streak_count || 0} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-headingText tracking-tighter leading-[1.1] md:leading-none">
            Master Your <br />
            <span className="text-wow italic px-2">Aptitude Skills.</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-mainText max-w-2xl font-medium leading-relaxed">
            Practice timed tests covering Quantitative, Logical, and Verbal reasoning. Questions adapt to your level — you'll never see the same question twice.
          </p>
          <div className="pt-4 flex gap-4 flex-wrap">
            <button 
              onClick={() => setShowTips(true)}
              className="flex items-center justify-center gap-3 px-6 py-4 md:px-8 md:py-4 w-full sm:w-auto bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-2xl text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
            >
              <HelpCircle className="w-5 h-5" /> APTITUDE TIPS & STRATEGIES
            </button>
          </div>
        </motion.div>

        {/* Difficulty Progress Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`glass-card p-8 border-2 ${diffInfo.bg} border-transparent`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Current Level</p>
            <p className={`text-3xl font-black uppercase ${diffInfo.color}`}>{diffInfo.label}</p>
            <p className="text-xs text-slate-400 mt-2">Next: {diffInfo.next}</p>
            <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mt-4 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${diffInfo.progress}%` }} />
            </div>
          </div>
          <div className="glass-card p-8 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">XP Today</p>
            <p className="text-3xl font-black text-amber-500 flex items-center gap-2"><Zap className="w-6 h-6 fill-amber-500" />{profile?.xp || 0}</p>
            <p className="text-xs text-slate-400 mt-2">Level {profile?.level || 1}</p>
          </div>
          <div className="glass-card p-8 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Streak</p>
            <p className="text-3xl font-black text-orange-500 flex items-center gap-2">
              <Flame className="w-6 h-6" /> {profile?.streak_count || 0} days
            </p>
            <p className="text-xs text-slate-400 mt-2">Keep it going!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          {TOPICS.map((t, idx) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-10 bg-white/40 dark:bg-white/5 group hover:border-indigo-500 border-white/60 dark:border-white/10 flex flex-col items-center text-center h-full"
            >
              <div className={`w-20 h-20 rounded-[2rem] ${t.bg} flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all duration-500 mb-8`}>
                <t.icon className={`w-10 h-10 ${t.color}`} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">{t.name}</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10">{t.desc}</p>
              
              <button 
                disabled={isLoading}
                onClick={() => startQuiz(t.id)} 
                className="btn-wow w-full py-5 justify-center flex items-center gap-4 scale-95 group-hover:scale-100 transition-transform"
              >
                {isLoading ? 'PREPARING...' : 'START TEST'} <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
        <PlacementTips category="aptitude" isOpen={showTips} onClose={() => setShowTips(false)} />
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  // ── RESULTS SCREEN ──
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="pb-20 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-16 w-full relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-center"
        >
          <div className={`absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${percentage >= 80 ? 'from-emerald-400 to-indigo-600' : 'from-rose-500 to-indigo-500'}`} />
          
          <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <Trophy className={`w-12 h-12 ${percentage >= 80 ? 'text-amber-500' : 'text-indigo-400'}`} />
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-headingText tracking-tighter mb-4 uppercase leading-[1.1] md:leading-none">
            Test <span className="text-wow italic px-4">Complete.</span>
          </h2>
          <p className="text-xl text-mainText font-medium mb-4">Results saved to your profile.</p>

          {/* XP Earned Banner */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl mb-10"
          >
            <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span className="text-xl font-black text-amber-600">+{xpEarned} XP Earned!</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
            <div className="p-10 glass bg-surface/60 dark:bg-white/5 border-border rounded-[2.5rem]">
              <p className="text-[10px] font-black text-mutedText uppercase tracking-widest mb-2">Score</p>
              <p className="text-7xl font-black text-headingText tracking-tighter leading-none">{percentage}%</p>
            </div>
            <div className="p-10 glass bg-headingText text-white rounded-[2.5rem] flex flex-col justify-center">
              <p className="text-[10px] font-black text-mutedText uppercase tracking-widest mb-4">Level</p>
              <p className={`text-3xl font-black uppercase tracking-tighter italic ${diffInfo.color}`}>{diffInfo.label}</p>
            </div>
            <div className="p-10 glass bg-surface/60 dark:bg-white/5 border-border rounded-[2.5rem]">
              <p className="text-[10px] font-black text-mutedText uppercase tracking-widest mb-2">Correct</p>
              <p className="text-7xl font-black text-emerald-500 tracking-tighter leading-none">{score}/{questions.length}</p>
            </div>
          </div>

          {percentage >= 75 && currentDifficulty !== 'Expert' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-10 p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl"
            >
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2 justify-center">
                <TrendingUp className="w-4 h-4" /> 
                Excellent! You're approaching <strong>{diffInfo.next}</strong> level. Keep it up!
              </p>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button type="button" onClick={() => startQuiz(selectedTopic!)} className="btn-wow px-6 py-4 md:px-10 md:py-5 w-full sm:w-auto justify-center sm:scale-110 flex items-center gap-4">
              <RotateCcw className="w-5 h-5" /> NEW QUESTIONS
            </button>
            <button type="button" onClick={() => setSelectedTopic(null)} className="px-6 py-4 md:px-10 md:py-5 w-full sm:w-auto justify-center text-center glass border-border text-xs font-black uppercase tracking-widest hover:bg-surface transition-all text-mainText">
              CHANGE TOPIC
            </button>
          </div>
        </motion.div>

        {showLevelUp && (
          <LevelUpBanner 
            oldDifficulty={prevDifficulty} 
            newDifficulty={currentDifficulty}
            onDismiss={() => setShowLevelUp(false)} 
          />
        )}
      </div>
    );
  }

  // ── ACTIVE QUIZ SCREEN ──
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative pb-20 pt-4 px-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button type="button" onClick={() => setSelectedTopic(null)} className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-3">
          <ArrowRight className="w-5 h-5 rotate-180" /> QUIT TEST
        </button>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`badge-premium ${diffInfo.bg} ${diffInfo.color} border-transparent`}>
            {diffInfo.label} Level
          </div>
          {isReset && (
            <div className="badge-premium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Star className="w-3 h-3" /> Fresh Challenge
            </div>
          )}
          <div className={`flex items-center gap-4 px-8 py-4 glass dark:bg-white/5 border-white/60 dark:border-white/10 rounded-2xl font-black tabular-nums transition-all ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
            <Timer className="w-5 h-5 text-indigo-500" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
          <span className="text-xs font-black text-emerald-600">{answeredCorrect.current} correct so far</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < currentIdx ? (questions[i]?.user_answer === Number(questions[i]?.correct_answer) ? 'bg-emerald-500' : 'bg-rose-400') :
              i === currentIdx ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-white/5'
            }`} />
          ))}
        </div>
      </div>

      <motion.div 
        layout
        className="glass-premium p-6 md:p-12 lg:p-20 relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-16"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white font-[900] leading-tight tracking-tight">
              {currentQ?.question_text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(currentQ?.options as string[] || []).map((opt, i) => {
                let style = "glass bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300";
                if (hasAnswered) {
                  if (i === Number(currentQ?.correct_answer)) style = "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/30";
                  else if (i === selectedOpt) style = "bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/30";
                  else style = "opacity-30 grayscale";
                } else if (selectedOpt === i) {
                  style = "bg-slate-950 text-white border-slate-950 shadow-2xl scale-[1.02]";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(i)}
                    disabled={hasAnswered}
                    className={`group w-full flex items-center justify-between p-4 sm:p-6 md:p-8 border-2 rounded-[2rem] transition-all duration-500 text-lg md:text-xl font-bold ${style}`}
                  >
                    <div className="flex items-center gap-6">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${selectedOpt === i && !hasAnswered ? 'bg-white/20' : 'bg-indigo-500/10'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-left leading-tight">{opt}</span>
                    </div>
                    {hasAnswered && i === Number(currentQ?.correct_answer) && <CheckCircle className="w-8 h-8 flex-shrink-0" />}
                    {hasAnswered && i === selectedOpt && i !== Number(currentQ?.correct_answer) && <XCircle className="w-8 h-8 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            {hasAnswered && currentQ?.explanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl"
              >
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Explanation
                </p>
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 leading-relaxed">{currentQ.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end pt-16 mt-16 border-t border-slate-100 dark:border-white/5">
          <button 
            type="button"
            onClick={handleNext}
            disabled={!hasAnswered}
            className="btn-wow px-8 py-4 sm:px-12 sm:py-6 sm:scale-110 w-full sm:w-auto justify-center disabled:opacity-30 disabled:scale-100 flex items-center gap-4"
          >
            {currentIdx === questions.length - 1 ? 'SEE RESULTS' : 'NEXT QUESTION'} 
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </motion.div>

      <PlacementTips category="aptitude" isOpen={showTips} onClose={() => setShowTips(false)} />
      {showLevelUp && (
        <LevelUpBanner 
          oldDifficulty={prevDifficulty} 
          newDifficulty={currentDifficulty}
          onDismiss={() => setShowLevelUp(false)} 
        />
      )}
    </div>
  );
}
