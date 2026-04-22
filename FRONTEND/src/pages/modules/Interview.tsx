import { useState, useEffect } from 'react';
import { 
  Video, RotateCcw, HelpCircle, ArrowRight, 
  Sparkles, ShieldCheck, Building2, ChevronRight, Zap, Star, TrendingUp, Flame
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { getAdaptiveDifficulty, type Difficulty } from '../../utils/adaptiveLearning';
import { databaseService } from '../../services/databaseService';
import { fetchSmartQuestions, getDifficultyLabel, calculateXP } from '../../utils/questionEngine';
import { PlacementTips } from '../../components/PlacementTips';
import { LevelUpBanner, StreakBadge } from '../../components/ProgressionSystem';
import { COMPANY_BENCHMARKS } from '../../constants/benchmarks';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const INTERVIEW_TOPICS = ['All', 'Behavioral', 'Technical', 'HR', 'Leadership', 'System Design'];

export function Interview() {
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const sessionType = location.state?.sessionType || null;

  const [selectedTopic, setSelectedTopic] = useState('All');
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Intermediate');
  const [prevDifficulty, setPrevDifficulty] = useState<Difficulty>('Intermediate');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [isReset, setIsReset] = useState(false);
  const [targetCompany, setTargetCompany] = useState<any>(
    COMPANY_BENCHMARKS.find(b => b.id === (profile?.target_company || 'google')) || COMPANY_BENCHMARKS[0]
  );

  useEffect(() => {
    fetchQuestions(selectedTopic);
  }, [user, sessionType, selectedTopic]);

  useEffect(() => {
    if (sessionType && !selectedQuestion && questions.length > 0 && !isLoading) {
      startQuestion(questions[0]);
    }
  }, [sessionType, questions, isLoading, selectedQuestion]);

  const fetchQuestions = async (topic: string) => {
    setIsLoading(true);
    try {
      const difficulty = await getAdaptiveDifficulty(user?.id || '', 'interview');
      const finalDifficulty: Difficulty = sessionType === 'challenge' ? 'Expert' : difficulty;
      setCurrentDifficulty(finalDifficulty);
      setPrevDifficulty(finalDifficulty);

      const categoryParam = topic === 'All' ? undefined : topic;
      const result = await fetchSmartQuestions(user?.id || '', 'interview', finalDifficulty, 9, categoryParam);
      
      if (result.isReset) {
        toast('🔄 You\'ve seen all questions! Starting a fresh round.', { duration: 4000 });
      }
      setIsReset(result.isReset);
      setQuestions(result.questions);
    } catch (err) {
      console.error('Interview fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuestion = (q: any) => {
    setSelectedQuestion(q);
    setAnswer('');
    setEvaluation(null);
    setIsEvaluating(false);
  };

  const goToNextQuestion = () => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < questions.length) {
      setQuestionIndex(nextIdx);
      startQuestion(questions[nextIdx]);
    } else {
      // End of questions — mark all as seen and go back to list
      if (user?.id) databaseService.markQuestionsAsSeen(user.id, questions.map(q => q.id));
      setSelectedQuestion(null);
      setQuestionIndex(0);
      toast.success('Session complete! Great work.', { icon: '🎉' });
    }
  };

  const evaluateAnswer = async () => {
    if (!answer.trim()) return;
    setIsEvaluating(true);

    // STAR heuristic scoring
    let score = 30;
    const starHeuristics = {
      situation: ['situation', 'context', 'problem', 'background', 'when', 'initially'],
      task: ['task', 'goal', 'objective', 'assigned', 'expectation', 'responsible'],
      action: ['action', 'i did', 'implemented', 'managed', 'executed', 'handled', 'led', 'coordinated', 'decided'],
      result: ['result', 'outcome', 'finally', 'achieved', 'consequently', 'impact', 'delivered', 'improved', 'reduced', 'increased']
    };

    const breakdown = {
      S: starHeuristics.situation.some(w => answer.toLowerCase().includes(w)),
      T: starHeuristics.task.some(w => answer.toLowerCase().includes(w)),
      A: starHeuristics.action.some(w => answer.toLowerCase().includes(w)),
      R: starHeuristics.result.some(w => answer.toLowerCase().includes(w)),
    };

    const starCount = Object.values(breakdown).filter(Boolean).length;
    score += starCount * 12.5;
    const words = answer.trim().split(/\s+/);
    if (words.length > 50) score += 10;
    if (words.length > 100) score += 10;
    score = Math.min(100, score);

    const confidence = Math.min(100, 40 + starCount * 15);
    const clarity = Math.min(100, (answer.length / 200) * 100);

    const feedback = starCount === 4
      ? "Excellent! Clear, structured, and impactful response."
      : starCount >= 2
      ? "Good effort. Strengthen your Situation and Result sections."
      : "Needs work. Apply the STAR framework: Situation → Task → Action → Result.";

    const xp = calculateXP(currentDifficulty, score);
    setXpEarned(prev => prev + xp);
    setSessionScores(prev => [...prev, score]);
    setEvaluation({ score, feedback, confidence, starBreakdown: breakdown, forensics: { clarity } });

    if (score >= 80) confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });

    if (user?.id) {
      try {
        await databaseService.saveInterviewScore({ 
          user_id: user.id, 
          question_category: selectedQuestion.category, 
          evaluation_score: score, 
          feedback 
        });
        await databaseService.markQuestionsAsSeen(user.id, [selectedQuestion.id]);
        await refreshProfile();
        window.dispatchEvent(new CustomEvent('ace-score-updated'));

        // Check level-up
        const newDifficulty = await getAdaptiveDifficulty(user.id, 'interview');
        if (newDifficulty !== currentDifficulty && newDifficulty !== 'Beginner') {
          setPrevDifficulty(currentDifficulty);
          setCurrentDifficulty(newDifficulty);
          setTimeout(() => setShowLevelUp(true), 1000);
        }
      } catch (err) { console.error('Interview saving failed'); }
    }
    setIsEvaluating(false);
  };

  const diffInfo = getDifficultyLabel(currentDifficulty);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64 text-indigo-500 font-black uppercase tracking-[0.5em] animate-pulse">
      Loading Interview Session...
    </div>
  );

  // ── EVALUATION RESULT SCREEN ──
  if (evaluation && selectedQuestion) {
    return (
      <div className="flex justify-center py-20 animate-fade-in px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-8 md:p-12 max-w-4xl w-full relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
          
          <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <ShieldCheck className="w-12 h-12 text-indigo-400" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">
            Evaluation <span className="text-wow italic px-4">Complete.</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-6">
            Question {questionIndex + 1} of {questions.length}
          </p>

          {/* XP Banner */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 px-8 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl mb-10"
          >
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-black text-amber-600">+{calculateXP(currentDifficulty, evaluation.score)} XP Earned</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
            <div className="p-12 glass bg-white dark:bg-white/5 border-white dark:border-white/10 rounded-[3rem]">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Your Score</p>
              <p className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{evaluation.score}%</p>
            </div>

            <div className="flex flex-col justify-center space-y-6 text-left">
              <div className="p-8 glass bg-indigo-600 text-white rounded-[2.5rem]">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Professional Feedback
                </p>
                <p className="text-lg font-bold italic leading-relaxed">"{evaluation.feedback}"</p>
              </div>

              <div className="p-6 bg-white dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">STAR Method Coverage</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(evaluation.starBreakdown).map(([key, val]) => (
                    <div key={key} className={`flex items-center gap-2 p-3 rounded-xl text-xs font-black ${val ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {key === 'S' ? 'Situation' : key === 'T' ? 'Task' : key === 'A' ? 'Action' : 'Result'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            {questionIndex + 1 < questions.length ? (
              <button type="button" onClick={goToNextQuestion} className="btn-wow px-6 py-4 md:px-12 md:py-5 w-full sm:w-auto justify-center sm:scale-110 flex items-center gap-4">
                NEXT QUESTION <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button type="button" onClick={() => { setSelectedQuestion(null); setQuestionIndex(0); }} className="btn-wow px-6 py-4 md:px-12 md:py-5 w-full sm:w-auto justify-center sm:scale-110 flex items-center gap-4">
                <RotateCcw className="w-5 h-5" /> NEW SESSION
              </button>
            )}
            <button type="button" onClick={() => setSelectedQuestion(null)} className="px-6 py-4 md:px-12 md:py-5 w-full sm:w-auto justify-center text-center glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white dark:text-white transition-all">
              BACK TO HUB
            </button>
          </div>
        </motion.div>

        {showLevelUp && (
          <LevelUpBanner oldDifficulty={prevDifficulty} newDifficulty={currentDifficulty} onDismiss={() => setShowLevelUp(false)} />
        )}
      </div>
    );
  }

  // ── ACTIVE QUESTION SCREEN ──
  if (selectedQuestion) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in px-6 pb-20">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <button type="button" onClick={() => setSelectedQuestion(null)} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-4">
            <ArrowRight className="w-5 h-5 rotate-180" /> BACK TO QUESTIONS
          </button>
          <div className="flex items-center gap-4">
            <div className={`badge-premium ${diffInfo.bg} ${diffInfo.color} border-transparent`}>{diffInfo.label} Level</div>
            <div className="badge-premium bg-slate-50 dark:bg-white/5 text-slate-500">{questionIndex + 1} / {questions.length}</div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            animate={{ width: `${((questionIndex) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <motion.div layout className="glass-premium p-6 md:p-12 lg:p-24 shadow-2xl relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-500/30">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Practice Session: {selectedQuestion.category}</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                  {targetCompany.name} Standards
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`badge-premium ${diffInfo.bg} ${diffInfo.color} border-transparent flex items-center gap-2`}>
                <Star className="w-3 h-3" /> {diffInfo.label}
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white font-[900] mb-16 leading-tight tracking-[-0.05em]">
            "{selectedQuestion.question_text}"
          </h2>

          <div className="space-y-8">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer using the STAR method: Situation → Task → Action → Result..."
              className="w-full h-64 md:h-72 bg-white dark:bg-slate-950/40 border border-white/60 dark:border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-lg md:text-xl font-medium leading-relaxed"
            />

            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 lg:gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <select 
                    value={targetCompany.id}
                    onChange={e => setTargetCompany(COMPANY_BENCHMARKS.find(b => b.id === e.target.value)!)}
                    className="bg-transparent text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest outline-none"
                  >
                    {COMPANY_BENCHMARKS.map(b => (
                      <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="badge-premium dark:bg-white/5 text-slate-500">
                  {answer.split(/\s+/).filter(w => w).length} words
                </div>
              </div>
              
              <button 
                onClick={evaluateAnswer}
                disabled={isEvaluating || answer.trim().length < 20}
                className="btn-wow px-8 py-4 sm:px-16 sm:py-6 sm:scale-110 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-4 w-full lg:w-auto"
              >
                {isEvaluating ? 'ANALYZING...' : 'SUBMIT FOR REVIEW'} <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── QUESTION SELECTION GRID ──
  return (
    <div className="max-w-[1700px] mx-auto animate-fade-in space-y-16 pb-32 pt-6 px-6">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-16 border-b border-indigo-500/10 pb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="badge-premium bg-indigo-50 text-indigo-600 dark:bg-white/5 dark:text-indigo-400">
              INTERVIEW PREPARATION HUB
            </div>
            <StreakBadge streak={profile?.streak_count || 0} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-slate-900 dark:text-white leading-[1.1] md:leading-[0.85] tracking-tighter uppercase italic">
            Master Your <br />
            <span className="text-wow px-4">Interview.</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            Practice with adaptive questions that progress with you. Every session builds on the last — no repeats, no boredom.
          </p>
        </div>

        <div className="glass-card p-10 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hidden md:block min-w-[260px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Level</p>
          <p className={`text-3xl font-black uppercase ${diffInfo.color} mb-2`}>{diffInfo.label}</p>
          <p className="text-xs text-slate-400">Next: {diffInfo.next}</p>
          <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${diffInfo.progress}%` }} />
          </div>
          {isReset && (
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-4 flex items-center gap-2">
              <Star className="w-3 h-3" /> Fresh question set loaded
            </p>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center mb-6 px-2">
        <button onClick={() => setShowTips(true)} className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-4 md:px-8 md:py-4 bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-2xl text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl text-center">
          <HelpCircle className="w-5 h-5 flex-shrink-0" /> View Interview Tips & Common Mistakes
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {INTERVIEW_TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              selectedTopic === topic
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'glass bg-white/60 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {questions.length === 0 ? (
        <div className="py-20 text-center glass border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] opacity-50">
          <Video className="w-16 h-16 mx-auto mb-6 text-slate-400" />
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-500">No Questions Available</h3>
          <p className="text-sm font-medium text-slate-400 mt-2">Add interview questions in the admin panel to start practicing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {questions.map((q, idx) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => { setQuestionIndex(idx); startQuestion(q); }}
              className="glass-card group flex flex-col transition-all cursor-pointer hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.2)] bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 h-full"
            >
              <div className="p-8 md:p-12 flex-grow space-y-8">
                <div className="flex justify-between items-center">
                  <div className="badge-premium bg-slate-950 text-white group-hover:bg-indigo-600 transition-colors">
                    {q.category}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    q.difficulty === 'Expert' ? 'text-rose-500' : q.difficulty === 'Intermediate' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>{q.difficulty}</span>
                </div>
                <p className="text-2xl md:text-3xl text-slate-900 dark:text-white font-[900] leading-tight tracking-tight group-hover:italic transition-all">
                  "{q.question_text}"
                </p>
              </div>
              <div className="px-8 py-6 md:px-12 md:py-8 bg-slate-950 text-white flex items-center justify-between group-hover:bg-indigo-600 transition-all">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4">
                  Practice This <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                </span>
                <div className="p-3 bg-white/10 rounded-xl">
                  <Building2 className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <PlacementTips category="interview" isOpen={showTips} onClose={() => setShowTips(false)} />
      {showLevelUp && (
        <LevelUpBanner oldDifficulty={prevDifficulty} newDifficulty={currentDifficulty} onDismiss={() => setShowLevelUp(false)} />
      )}
    </div>
  );
}
