import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, Timer, Play, Square, ArrowRight, Activity, Shuffle, Sliders, Star, CheckCircle, Info, MessageSquare, RotateCcw, ShieldCheck, Zap, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { databaseService } from '../../services/databaseService';
import { getAdaptiveDifficulty, type Difficulty } from '../../utils/adaptiveLearning';
import { fetchSmartQuestions, getDifficultyLabel, calculateXP } from '../../utils/questionEngine';
import confetti from 'canvas-confetti';
import { PlacementTips } from '../../components/PlacementTips';
import { LevelUpBanner, StreakBadge } from '../../components/ProgressionSystem';

const GD_TOPICS = ['All', 'Technology', 'Business', 'Social'];

export function GroupDiscussion() {
  const { user, refreshProfile, profile } = useAuth();
  const location = useLocation();
  const sessionType = location.state?.sessionType || null;

  const [selectedTopicState, setSelectedTopicState] = useState('All');
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Intermediate');
  const [prevDifficulty, setPrevDifficulty] = useState<Difficulty>('Intermediate');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [isReset, setIsReset] = useState(false);

  const [empathy, setEmpathy] = useState(5);
  const [structure, setStructure] = useState(5);
  const [clarity, setClarity] = useState(5);

  useEffect(() => {
    const fetchTopics = async (topic: string) => {
      setIsLoading(true);
      try {
        let difficulty = await getAdaptiveDifficulty(user?.id || '', 'gd');
        const finalDifficulty: Difficulty = sessionType === 'challenge' ? 'Expert' : difficulty || 'Intermediate';
        setCurrentDifficulty(finalDifficulty);
        setPrevDifficulty(finalDifficulty);

        const categoryParam = topic === 'All' ? undefined : topic;
        const result = await fetchSmartQuestions(user?.id || '', 'gd', finalDifficulty, 8, categoryParam);
        if (result.isReset) {
          toast('🔄 You\'ve seen all GD topics! Fresh discussion topics loaded.', { duration: 4000 });
        }
        setIsReset(result.isReset);
        setTopics(result.questions);
      } catch (err: any) {
        console.error('GD Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics(selectedTopicState);
  }, [user, sessionType, selectedTopicState]);

  useEffect(() => {
    if (sessionType && !selectedTopic && topics.length > 0 && !isLoading) {
      const idx = Math.floor(Math.random() * topics.length);
      setSelectedTopic(topics[idx]);
    }
  }, [sessionType, topics, isLoading, selectedTopic]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const startEvaluation = () => { setIsActive(false); setIsEvaluating(true); };

  const finishSession = async () => {
    setSessionCompleted(true);
    setIsEvaluating(false);
    if (user?.id && selectedTopic) {
      try {
        const avgScore = Math.round((empathy + structure + clarity) / 3 * 10);
        const xp = calculateXP(currentDifficulty, avgScore);
        setSessionXP(prev => prev + xp);
        await databaseService.saveGDSession({ user_id: user.id, topic: selectedTopic.question_text, duration_seconds: seconds, status: 'completed', score: avgScore });
        if (avgScore >= 80) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        await databaseService.markQuestionsAsSeen(user.id, [selectedTopic.id]);
        await refreshProfile();
        window.dispatchEvent(new CustomEvent('ace-score-updated'));

        // Check difficulty level-up
        const newDifficulty = await getAdaptiveDifficulty(user.id, 'gd');
        if (newDifficulty && newDifficulty !== currentDifficulty && newDifficulty !== 'Beginner') {
          setPrevDifficulty(currentDifficulty);
          setCurrentDifficulty(newDifficulty);
          setTimeout(() => setShowLevelUp(true), 800);
        }
      } catch (err) { console.error('GD session saving failed'); }
    }
  };

  const pickRandomTopic = () => {
    if (topics.length === 0) return;
    setSelectedTopic(topics[Math.floor(Math.random() * topics.length)]);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const reset = () => {
    setSelectedTopic(null);
    setSessionCompleted(false);
    setIsEvaluating(false);
    setSeconds(0);
    setEmpathy(5);
    setStructure(5);
    setClarity(5);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64 text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse">Preparing Session...</div>;

  if (sessionCompleted) {
    const avgScore = Math.round((empathy + structure + clarity) / 3 * 10);
    return (
      <>
      <div className="pb-20 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-8 md:p-16 w-full relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
          
          <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <Star className="w-12 h-12 text-emerald-400" />
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase leading-[1.1] md:leading-none">
              Group <span className="text-wow italic px-4">Discussion Complete.</span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium mb-6">Your performance metrics have been updated in your profile.</p>

          {sessionXP > 0 && (
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl mb-8">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-600">+{sessionXP} XP Earned!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
             <div className="p-8 md:p-10 glass bg-emerald-600 text-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-emerald-500/20">
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-4">Practice Duration</p>
                <p className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none">{formatTime(seconds)}</p>
             </div>
             
             <div className="p-8 md:p-10 glass bg-slate-950 text-white rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Average Score</p>
                <p className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter leading-none text-emerald-500">{avgScore}%</p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
             <button type="button" onClick={reset} className="btn-wow px-6 py-4 md:px-12 md:py-6 w-full sm:w-auto justify-center sm:scale-110 flex items-center gap-4">
                <RotateCcw className="w-5 h-5" /> NEXT TOPIC
             </button>
             <Link to="/practice" className="px-6 py-4 md:px-12 md:py-6 w-full sm:w-auto justify-center text-center glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white dark:text-white transition-all flex items-center gap-4">
                PRACTICE HUB <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        </motion.div>
      </div>
      {showLevelUp && (
        <LevelUpBanner oldDifficulty={prevDifficulty} newDifficulty={currentDifficulty} onDismiss={() => setShowLevelUp(false)} />
      )}
      </>
    );
  }

  if (selectedTopic) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-12 animate-fade-in px-6 pb-20">
        <button type="button" onClick={reset} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-4">
          <ArrowRight className="w-5 h-5 rotate-180" /> CLOSE SESSION
        </button>

        <motion.div 
          layout
          className="glass-premium p-6 md:p-12 lg:p-24 shadow-2xl relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
        >
          <div className="absolute top-0 right-0 p-16 opacity-5">
             <Users className="w-80 h-80 text-emerald-500" />
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">GD Training Session</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Subject: {selectedTopic.category}</p>
                </div>
             </div>
             <div className="badge-premium bg-slate-950 text-white flex items-center gap-4 border-white/10">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /> LIVE SESSION
             </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white font-[900] mb-12 md:mb-20 leading-[1.1] tracking-tight">
            "{selectedTopic.question_text}"
          </h2>

          {!isEvaluating ? (
            <div className="flex flex-col items-center">
              <div className="p-8 md:p-16 glass bg-slate-950 text-white rounded-[2rem] md:rounded-[4rem] mb-12 md:mb-20 flex flex-col items-center shadow-3xl shadow-emerald-900/20 relative overflow-hidden w-full max-w-2xl">
                <div className="absolute inset-0 bg-hero-liquid opacity-5" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-6 md:mb-10 relative z-10">Session Elapsed Time</p>
                <div className={`text-6xl md:text-8xl lg:text-9xl font-[900] tabular-nums tracking-tighter relative z-10 ${isActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {formatTime(seconds)}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-8 justify-center w-full">
                <button 
                  type="button"
                  onClick={toggleTimer}
                  className={`px-8 py-4 sm:px-16 sm:py-7 rounded-2xl sm:rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl w-full sm:w-auto ${
                    isActive 
                      ? 'bg-rose-600 text-white shadow-rose-500/30 sm:scale-105' 
                      : 'btn-wow sm:scale-125'
                  }`}
                >
                  {isActive ? <><Activity className="w-6 h-6 animate-spin-slow" /> STOP TIMER</> : <><Play className="w-6 h-6" /> START DISCUSSION</>}
                </button>
                
                <button 
                  type="button"
                  onClick={startEvaluation}
                  disabled={seconds === 0}
                  className="px-8 py-4 sm:px-16 sm:py-7 glass border-white/60 dark:border-white/10 text-slate-900 dark:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-2xl sm:rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all w-full sm:w-auto text-center"
                >
                  <Square className="w-6 h-6" /> EVALUATE SELF
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full max-w-3xl mt-10 space-y-16"
            >
               <div className="flex items-center gap-6 pb-10 border-b border-white/10">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sliders className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Performance Self-Audit</h3>
               </div>
               
               <div className="space-y-12">
                  {[
                    { label: 'Empathy & Active Listening', val: empathy, set: setEmpathy },
                    { label: 'Argument Structure', val: structure, set: setStructure },
                    { label: 'Communication Clarity', val: clarity, set: setClarity },
                  ].map((m, i) => (
                    <div key={i} className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-6 py-2 rounded-xl border border-indigo-500/20">{m.val}/10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={m.val} 
                        onChange={(e) => m.set(Number(e.target.value))} 
                        className="w-full h-3 bg-slate-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                      />
                    </div>
                  ))}
               </div>

               <button onClick={finishSession} className="btn-wow w-full py-8 text-xl justify-center">
                  SAVE SESSION RESULTS <Zap className="w-8 h-8 fill-current" />
               </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto animate-fade-in space-y-16 pb-32 pt-6 px-6">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-16 border-b border-emerald-500/10 pb-20">
        <div className="space-y-6">
          <div className="badge-premium bg-emerald-50 text-emerald-600 dark:bg-white/5 dark:text-emerald-400 inline-block">
               GD Training: Group Discussion
          </div>
          <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
               Master the <br />
               <span className="text-wow px-4 text-emerald-500">Group Talk.</span>
          </h1>
          <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
               Practice group discussions on trending topics. Improve your communication and leadership skills.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowTips(true)}
            className="btn-wow flex items-center gap-4 px-10 py-5 bg-white dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-2xl text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest shadow-xl"
          >
            <HelpCircle className="w-5 h-5" /> GD TIPS & ETIQUETTE
          </button>
          <button 
            onClick={pickRandomTopic}
            disabled={topics.length === 0}
            className="btn-wow scale-110 flex items-center gap-4 px-10 py-5"
          >
            <Shuffle className="w-6 h-6" /> GET RANDOM TOPIC
          </button>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {GD_TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => setSelectedTopicState(topic)}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              selectedTopicState === topic
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'glass bg-white/60 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {topics.length > 0 ? topics.map((t, idx) => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedTopic(t)}
            className="glass-card group flex flex-col transition-all cursor-pointer hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.2)] bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 h-full overflow-hidden"
          >
            <div className="p-12 flex-grow space-y-10">
               <div className="flex justify-between items-center">
                  <div className={`badge-premium ${t.difficulty === 'Expert' ? 'bg-rose-500' : 'bg-slate-950'} text-white group-hover:bg-emerald-600 transition-colors`}>
                     DIFFICULTY: {t.difficulty}
                  </div>
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 opacity-20 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
               </div>
               <p className="text-3xl text-slate-900 dark:text-white font-[900] leading-tight tracking-tight group-hover:italic transition-all">
                 "{t.question_text}"
               </p>
               <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Activity className="w-4 h-4 text-emerald-500" /> CATEGORY // {t.category}
               </div>
            </div>
            <div className="px-12 py-8 bg-slate-950 text-white flex items-center justify-between group-hover:bg-emerald-600 transition-all">
               <span className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4">
                  Start Practice Session <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
               </span>
               <Play className="w-6 h-6 text-emerald-400 group-hover:text-white" />
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center glass border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] opacity-50">
            <Users className="w-16 h-16 mx-auto mb-6 text-slate-400" />
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-500">No Discussion Topics Available</h3>
            <p className="text-sm font-medium text-slate-400 mt-2">Add topics in the admin panel to start training.</p>
          </div>
        )}
      </div>
      <PlacementTips category="gd" isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
}
