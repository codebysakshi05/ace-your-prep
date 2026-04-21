import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Brain, Target, Timer, Trophy, Zap, Shield, ChevronRight, CheckCircle, XCircle, RotateCcw,
  ArrowRight, AlertCircle, TrendingUp, Sparkles, Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { getAdaptiveDifficulty } from '../../utils/adaptiveLearning';
import { databaseService } from '../../services/databaseService';
import confetti from 'canvas-confetti';

const TOPICS = [
  { id: 'Quants', name: 'Quantitative Aptitude', desc: 'Numbers, algebra, and geometry.', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'Logical', name: 'Logical Reasoning', desc: 'Puzzles, sequences, and logic.', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'Verbal', name: 'Verbal Ability', desc: 'Grammar, vocabulary, and reading.', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'MOCK', name: 'Full Mock Test', desc: 'Random mix of all categories.', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' }
];

export function Aptitude() {
  const { user, refreshProfile } = useAuth();
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
  const [showReview, setShowReview] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('Intermediate');

  useEffect(() => {
    let timer: any = null;
    if (selectedTopic && !showResult && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedTopic, showResult, timeLeft]);

  useEffect(() => {
    const focusTopic = location.state?.focusTopic;
    if (focusTopic && user?.id) {
      startQuiz(focusTopic);
    }
  }, [location.state, user]);

  const startQuiz = async (topicId: string) => {
    try {
      setIsLoading(true);
      let targetTopic = topicId;
      
      // AI Logic: Detect if this is an AI-suggested "Weakness Intercept" mission
      const isWeaknessIntercept = location.state?.isMission || false;
      
      if (isWeaknessIntercept) {
        toast.success(`Neural Intercept: Targeted training active for ${topicId}`, { icon: '🤖' });
      }

      if (sessionType === 'focus' && user?.id) {
        const insights = await databaseService.fetchPerformanceInsights(user.id);
        if (insights?.weakest?.id) {
          targetTopic = 'MOCK';
          toast.success(`Focus Mode: Deep dive into ${insights.weakest.name}`, { icon: '🎯' });
        }
      }

      let recommendedDifficulty = await getAdaptiveDifficulty(user?.id || '', 'aptitude');
      if (sessionType === 'challenge') recommendedDifficulty = 'Expert';
      setCurrentDifficulty(recommendedDifficulty);
      
      const seenIds = await databaseService.fetchSeenQuestionIds(user?.id || '');

      let { data, error } = await supabase.from('module_questions').select('*').eq('module_type', 'aptitude');
      if (error) throw error;
      if (!data) data = [];

      let filtered = targetTopic !== 'MOCK' ? data.filter(q => q.category === targetTopic) : data;
      let pool = filtered.filter(q => q.difficulty === recommendedDifficulty && !seenIds.includes(q.id));
      
      if (pool.length < 5) pool = filtered.filter(q => !seenIds.includes(q.id));
      if (pool.length < 3) pool = filtered;

      const limit = sessionType === 'quick' ? 5 : sessionType === 'sprint' ? 15 : sessionType === 'mock' || sessionType === 'challenge' ? 20 : 10;
      const duration = sessionType === 'quick' ? 300 : sessionType === 'sprint' ? 900 : sessionType === 'mock' || sessionType === 'challenge' ? 1200 : 600;

      if (pool.length > 0) {
        const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, limit);
        setQuestions(shuffled);
        setSelectedTopic(targetTopic);
        setCurrentIdx(0);
        setScore(0);
        scoreRef.current = 0;
        setShowResult(false);
        setSelectedOpt(null);
        setHasAnswered(false);
        setTimeLeft(duration);
        setShowReview(false);
      } else {
        toast.error("Tactical pool exhausted.");
      }
    } catch (err: any) {
      toast.error(`Connectivity Failure: ${err.message}`);
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
      setScore(scoreRef.current);
      toast.success('Confirmed.', { duration: 800 });
    } else {
      toast.error('Deviation Detected.', { duration: 800 });
    }
  };

  const submitQuiz = async (isTimeout = false) => {
    setShowResult(true);
    if (user?.id && selectedTopic) {
      const percentage = Math.round((scoreRef.current / questions.length) * 100);
      
      if (percentage >= 80) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      try {
        await databaseService.saveAptitudeScore({ user_id: user.id, topic: selectedTopic, score: percentage, total_questions: questions.length });
        await refreshProfile();
        if (questions.length > 0) await databaseService.markQuestionsAsSeen(user?.id || '', questions.map(q => q.id));
        window.dispatchEvent(new CustomEvent('ace-score-updated'));
      } catch (err) {
        console.error('Score saving failed:', err);
      }
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

  if (!selectedTopic || questions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 pb-20 pt-6 px-6 animate-fade-in">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
           <div className="badge-premium bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-white/5 dark:text-indigo-400 inline-block">
                Intelligence Node: Aptitude
           </div>
           <h1 className="text-6xl md:text-8xl font-[900] text-slate-900 dark:text-white tracking-tighter leading-none">
                Hone Your <br />
                <span className="text-wow italic px-2">Logical DNA.</span>
           </h1>
           <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                Execute precision-timed assessments covering Quantitative, Logical, and Verbal clusters. Adaptive complexity active.
           </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
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
                {isLoading ? 'INITIATING...' : 'EXECUTE'} <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  if (showResult) {
    const percentage = Math.round((score/questions.length)*100);
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

            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase leading-none">
                Session <span className="text-wow italic px-4">Terminated.</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">Performance analysis synchronised with tactical profile.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-10">
                <div className="p-10 glass bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 rounded-[2.5rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Neural Scan Score</p>
                    <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{percentage}%</p>
                </div>
                <div className="p-10 glass bg-slate-900 text-white rounded-[2.5rem] flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Command Verdict</p>
                    <p className="text-3xl font-black uppercase tracking-tighter italic">{percentage >= 80 ? 'Elite' : percentage >= 50 ? 'Stable' : 'Novice'}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button onClick={() => startQuiz(selectedTopic)} className="btn-wow px-10 py-5 scale-110 flex items-center gap-4">
                    <RotateCcw className="w-5 h-5" /> RE-ENGAGE
                </button>
                <button onClick={() => setSelectedTopic(null)} className="px-10 py-5 glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white transition-all dark:text-white">
                    RETURN TO HUB
                </button>
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in relative pb-20 pt-4 px-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedTopic(null)} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-3">
          <ArrowRight className="w-5 h-5 rotate-180" /> ABORT BATCH
        </button>
        
        <div className="flex items-center gap-6">
           <div className="badge-premium bg-slate-950 text-white">
              SITUATION: {currentDifficulty}
           </div>
           <div className={`flex items-center gap-4 px-8 py-4 glass dark:bg-white/5 border-white/60 dark:border-white/10 rounded-2xl font-black tabular-nums transition-all ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
             <Timer className="w-5 h-5 text-indigo-500" />
             {formatTime(timeLeft)}
           </div>
        </div>
      </div>

      <motion.div 
        layout
        className="glass-premium p-12 md:p-20 relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-slate-100 dark:bg-white/5">
           <motion.div 
             className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 animate-shimmer" 
             initial={{ width: 0 }}
             animate={{ width: `${(currentIdx / questions.length) * 100}%` }}
           />
        </div>

        <div className="flex justify-between items-center mb-16">
            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em]">Dispatch {currentIdx + 1} of {questions.length}</span>
            <div className="flex gap-2">
                {questions.map((_, i) => (
                    <div key={i} className={`w-10 h-1.5 rounded-full transition-all duration-700 ${i === currentIdx ? 'bg-indigo-600 w-16' : i < currentIdx ? 'bg-indigo-300 dark:bg-indigo-900' : 'bg-slate-200 dark:bg-white/5'}`} />
                ))}
            </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-16"
          >
            <h2 className="text-3xl md:text-5xl text-slate-900 dark:text-white font-[900] leading-tight tracking-tight">
              {currentQ?.question_text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(currentQ?.options as string[] || []).map((opt, i) => {
                let style = "glass bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300";
                
                if (hasAnswered) {
                  if (i === Number(currentQ?.correct_answer)) {
                    style = "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/30";
                  } else if (i === selectedOpt) {
                    style = "bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/30";
                  } else {
                    style = "opacity-30 grayscale";
                  }
                } else if (selectedOpt === i) {
                   style = "bg-slate-950 text-white border-slate-950 shadow-2xl scale-[1.02]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={hasAnswered}
                    className={`group w-full flex items-center justify-between p-8 border-2 rounded-[2rem] transition-all duration-500 text-xl font-bold ${style}`}
                  >
                    <div className="flex items-center gap-6">
                       <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${selectedOpt === i && !hasAnswered ? 'bg-white/20' : 'bg-indigo-500/10'}`}>{String.fromCharCode(65 + i)}</span>
                       <span className="text-left leading-tight">{opt}</span>
                    </div>
                    {hasAnswered && i === Number(currentQ?.correct_answer) && <CheckCircle className="w-8 h-8" />}
                    {hasAnswered && i === selectedOpt && i !== Number(currentQ?.correct_answer) && <XCircle className="w-8 h-8" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end pt-16 mt-16 border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={handleNext}
            disabled={!hasAnswered}
            className="btn-wow px-16 py-6 scale-110 disabled:opacity-30 disabled:scale-100 flex items-center gap-4"
          >
            {currentIdx === questions.length - 1 ? 'UPLOAD RESULTS' : 'NEXT DISPATCH'} 
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
