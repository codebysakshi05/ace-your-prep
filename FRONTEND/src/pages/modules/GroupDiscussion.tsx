import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, Timer, Play, Square, ArrowRight, Activity, Shuffle, Sliders, Star, CheckCircle, Info, MessageSquare, RotateCcw, ShieldCheck, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { databaseService } from '../../services/databaseService';
import { getAdaptiveDifficulty } from '../../utils/adaptiveLearning';
import confetti from 'canvas-confetti';

export function GroupDiscussion() {
  const { user, refreshProfile } = useAuth();
  const location = useLocation();
  const sessionType = location.state?.sessionType || null;
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [empathy, setEmpathy] = useState(5);
  const [structure, setStructure] = useState(5);
  const [clarity, setClarity] = useState(5);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        let recommendedDifficulty = await getAdaptiveDifficulty(user?.id || '', 'gd');
        if (sessionType === 'challenge') recommendedDifficulty = 'Expert';

        let { data, error } = await supabase
          .from('module_questions')
          .select('*')
          .eq('module_type', 'gd');
        
        if (error) throw error;
        if (!data) data = [];

        const seenIds = await databaseService.fetchSeenQuestionIds(user?.id || '');
        let pool = data.filter(q => q.difficulty === recommendedDifficulty && !seenIds.includes(q.id));
        if (pool.length < 3) pool = data.filter(q => !seenIds.includes(q.id));
        if (pool.length < 2) pool = data;

        setTopics(pool);
      } catch (err: any) {
        console.error("GD Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, [user, sessionType]);

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
        await databaseService.saveGDSession({ user_id: user.id, topic: selectedTopic.question_text, duration_seconds: seconds, status: 'completed', score: avgScore });
        if (avgScore >= 80) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        await refreshProfile();
        window.dispatchEvent(new CustomEvent('ace-score-updated'));
        await databaseService.markQuestionsAsSeen(user.id, [selectedTopic.id]);
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

  if (isLoading) return <div className="flex justify-center items-center h-64 text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse">Initializing Crowd Node...</div>;

  if (sessionCompleted) {
    const avgScore = Math.round((empathy + structure + clarity) / 3 * 10);
    return (
      <div className="pb-20 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-16 w-full relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
          
          <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <Star className="w-12 h-12 text-emerald-400" />
          </div>

          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase leading-none">
              Group <span className="text-wow italic px-4">Concluded.</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">Social dynamics metrics synchronized with your cognitive profile.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
             <div className="p-10 glass bg-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-500/20">
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-4">Command Post Duration</p>
                <p className="text-6xl font-black tabular-nums tracking-tighter leading-none">{formatTime(seconds)}</p>
             </div>
             
             <div className="p-10 glass bg-slate-950 text-white rounded-[2.5rem] flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mastery Alignment</p>
                <p className="text-6xl font-black tabular-nums tracking-tighter leading-none text-emerald-500">{avgScore}%</p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <button onClick={reset} className="btn-wow px-12 py-6 scale-110 flex items-center gap-4">
                <RotateCcw className="w-5 h-5" /> RE-ENGAGE
             </button>
             <Link to="/practice" className="px-12 py-6 glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white dark:text-white transition-all flex items-center gap-4">
                PRACTICE HUB <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-12 animate-fade-in px-6 pb-20">
        <button onClick={reset} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-4">
          <ArrowRight className="w-5 h-5 rotate-180" /> CLOSE SESSION
        </button>

        <motion.div 
          layout
          className="glass-premium p-16 md:p-24 shadow-2xl relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
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
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Intelligence Cluster: GD</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Subject: {selectedTopic.category}</p>
                </div>
             </div>
             <div className="badge-premium bg-slate-950 text-white flex items-center gap-4 border-white/10">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /> CLOCK SYNCED
             </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl text-slate-900 dark:text-white font-[900] mb-20 leading-[1.1] tracking-tight">
            "{selectedTopic.question_text}"
          </h2>

          {!isEvaluating ? (
            <div className="flex flex-col items-center">
              <div className="p-16 glass bg-slate-950 text-white rounded-[4rem] mb-20 flex flex-col items-center shadow-3xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-liquid opacity-5" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-10 relative z-10">Session Elapsed Time</p>
                <div className={`text-9xl font-[900] tabular-nums tracking-tighter relative z-10 ${isActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {formatTime(seconds)}
                </div>
              </div>

              <div className="flex flex-wrap gap-8 justify-center">
                <button 
                  onClick={toggleTimer}
                  className={`px-16 py-7 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center gap-4 transition-all shadow-2xl ${
                    isActive 
                      ? 'bg-rose-600 text-white shadow-rose-500/30 scale-105' 
                      : 'btn-wow scale-125'
                  }`}
                >
                  {isActive ? <><Activity className="w-6 h-6 animate-spin-slow" /> HALT TRANSMISSION</> : <><Play className="w-6 h-6" /> INITIATE DEBATE</>}
                </button>
                
                <button 
                  onClick={startEvaluation}
                  disabled={seconds === 0}
                  className="px-16 py-7 glass border-white/60 dark:border-white/10 text-slate-900 dark:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center gap-4 transition-all"
                >
                  <Square className="w-6 h-6" /> RENDER AUDIT
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
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Diplomatic Self-Audit</h3>
               </div>
               
               <div className="space-y-12">
                  {[
                    { label: 'Empathy & Node Listening', val: empathy, set: setEmpathy },
                    { label: 'Strategic Argument Structure', val: structure, set: setStructure },
                    { label: 'Communication Transparency', val: clarity, set: setClarity },
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
                  SYNCHRONIZE SESSION <Zap className="w-8 h-8 fill-current" />
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
               Neural Simulation Node: Crowd Intel
          </div>
          <h1 className="text-7xl md:text-9xl font-[900] text-slate-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
               Master the <br />
               <span className="text-wow px-4 text-emerald-500">Global Echo.</span>
          </h1>
          <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
               Execute collective intelligence sessions over real-world geopolitical and corporate topics. Adaptive social complexity active.
          </p>
        </div>
        <button 
          onClick={pickRandomTopic}
          disabled={topics.length === 0}
          className="btn-wow scale-110 flex items-center gap-4 px-10 py-5"
        >
          <Shuffle className="w-6 h-6" /> DEPLOY RANDOM TOPIC
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {topics.map((t, idx) => (
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
                     STRESS LEVEL: {t.difficulty}
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
                  Request Crowdsource Mission <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
               </span>
               <Play className="w-6 h-6 text-emerald-400 group-hover:text-white" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
