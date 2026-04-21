import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Brain, Video, 
  ArrowRight, Loader2, Trophy, Activity,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../services/databaseService';

type MissionPhase = 'briefing' | 'aptitude' | 'interview' | 'debriefing';

export function MissionRoom() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<MissionPhase>('briefing');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [aptScore, setAptScore] = useState(0);
  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins total

  // --- Mission Logic ---
  const startMission = async () => {
    setLoading(true);
    try {
      const { data: aptData } = await supabase
        .from('module_questions')
        .select('*')
        .eq('module_type', 'aptitude')
        .limit(3);
      
      const { data: intData } = await supabase
        .from('module_questions')
        .select('*')
        .eq('module_type', 'interview')
        .limit(1);

      if (aptData && intData) {
        setQuestions([...aptData, ...intData]);
        setPhase('aptitude');
      }
    } catch (err) {
      console.error("Mission initialization failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (phase !== 'briefing' && phase !== 'debriefing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleAptitudeAnswer = (isCorrect: boolean) => {
    if (isCorrect) setAptScore(s => s + 1);
    if (currentIdx < 2) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setPhase('interview');
      setCurrentIdx(3);
    }
  };

  const submitInterview = async () => {
    setLoading(true);
    // Simple heuristic analysis for Blitz mode
    const score = Math.min(100, Math.round(answer.length / 5) + 30);
    setInterviewResult({ score, feedback: "Blitz assessment complete. Trajectory updated." });
    
    // Save results
    if (user?.id) {
       try {
         await databaseService.saveAptitudeScore({
           user_id: user.id, topic: 'BLITZ', score: Math.round((aptScore/3)*100), total_questions: 3
         });
         await databaseService.saveInterviewScore({
           user_id: user.id, question_category: 'BLITZ', evaluation_score: score, feedback: "Rapid Mission Complete"
         });
       } catch (err) {
         console.warn("Mission save partially deferred:", err);
       }
       await refreshProfile();
        window.dispatchEvent(new CustomEvent('ace-score-updated'));
    }
    
    setPhase('debriefing');
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <Loader2 className="w-20 h-20 text-primary animate-spin opacity-20" />
       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Syncing Neural Mission...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-fade-in px-4">
      <AnimatePresence mode="wait">
        {phase === 'briefing' && (
          <motion.div 
            key="briefing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-16 text-center space-y-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-primary/20 shadow-xl">
               <Zap className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
               <h1 className="text-5xl font-black text-white tracking-tighter uppercase">MISSION: BLITZ</h1>
               <p className="text-indigo-300/40 text-xs font-black uppercase tracking-[0.3em]">Phase 12: Rapid Evolution Protocol</p>
            </div>
            <p className="text-lg text-indigo-100/60 font-medium leading-relaxed max-w-2xl mx-auto italic">
              "A high-intensity, multi-vector training cycle. 10 minutes. 4 objectives. No hesitation. Perfect for the professional user on the move."
            </p>
            <div className="flex flex-col items-center gap-6">
               <button onClick={startMission} className="btn-primary px-16 py-6 group">
                  Initialize Mission <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
               </button>
               <span className="text-[9px] font-black text-white/10 uppercase tracking-widest leading-none">Authorization Required: Level 1+</span>
            </div>
          </motion.div>
        )}

        {phase === 'aptitude' && (
          <motion.div 
            key="aptitude"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center text-white">
               <div className="flex items-center gap-4">
                  <Brain className="w-6 h-6 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Sector I: Structural Logic</span>
               </div>
               <div className="text-sm font-black tabular-nums bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-primary">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
               </div>
            </div>

            <div className="glass-card p-12 md:p-16 space-y-12 border-indigo-500/20 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIdx / 3) * 100}%` }}
                  />
               </div>
               <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                  "{questions[currentIdx]?.question_text}"
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(questions[currentIdx]?.options as string[] || []).map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleAptitudeAnswer(i === Number(questions[currentIdx].correct_answer))}
                      className="group flex items-center justify-between p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-primary transition-all text-left"
                    >
                       <span className="text-indigo-100 font-bold group-hover:text-white transition-colors">{opt}</span>
                       <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all" />
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {phase === 'interview' && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center text-white">
               <div className="flex items-center gap-4">
                  <Video className="w-6 h-6 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Sector II: Articulation Pulse</span>
               </div>
               <div className="text-sm font-black tabular-nums bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-rose-500">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
               </div>
            </div>

            <div className="glass-card p-12 md:p-16 space-y-10 border-rose-500/20 shadow-2xl">
               <h2 className="text-2xl font-black text-white italic">
                  "{questions[3]?.question_text}"
               </h2>
               <textarea 
                 autoFocus
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 placeholder="Enter your rapid-fire response..."
                 className="w-full h-48 bg-slate-950/60 border border-white/5 rounded-3xl p-8 text-white focus:outline-none focus:border-rose-500/50 resize-none text-xl font-medium"
               />
               <div className="flex justify-end">
                  <button onClick={submitInterview} className="btn-primary bg-rose-500 border-rose-600 px-12 py-5 shadow-rose-500/20">
                     Complete Mission
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {phase === 'debriefing' && (
          <motion.div 
            key="debriefing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-16 text-center space-y-12"
          >
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
               <Trophy className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-2">
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Neural Link Synchronized</p>
               <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Debriefing Complete</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-8 max-w-xl mx-auto">
               <div className="bg-slate-950/40 p-8 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Logic Pulse</p>
                  <p className="text-4xl font-black text-white">{aptScore}/3</p>
               </div>
               <div className="bg-slate-950/40 p-8 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Vocal Precision</p>
                  <p className="text-4xl font-black text-white">{interviewResult?.score}%</p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-white/5">
               <button onClick={() => setPhase('briefing')} className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                  Run Sequence Again
               </button>
               <button onClick={() => navigate('/dashboard')} className="btn-primary px-12 py-5">
                  Return to Dashboard
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 Active Telemetry HUD (Fixed Bottom) */}
      {phase !== 'briefing' && phase !== 'debriefing' && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
           <div className="glass-card !bg-slate-950/80 backdrop-blur-3xl p-5 border-white/10 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Activity className="w-4 h-4" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Neural Link</p>
                    <p className="text-xs font-black text-white uppercase leading-none mt-1">Status: Stable</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="h-6 w-px bg-white/10"></div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Growth Pulse</p>
                    <p className="text-xs font-black text-primary uppercase leading-none mt-1">+120 XP Est.</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
