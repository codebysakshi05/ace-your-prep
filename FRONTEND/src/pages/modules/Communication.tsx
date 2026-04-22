import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Mic, CheckCircle, Sliders, 
  Quote, Zap, Activity, Info, Sparkles, RotateCcw, ArrowRight, Trophy, ShieldCheck, HelpCircle, Star, Flame
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { getAdaptiveDifficulty, type Difficulty } from '../../utils/adaptiveLearning';
import { databaseService } from '../../services/databaseService';
import { fetchSmartQuestions, getDifficultyLabel, calculateXP } from '../../utils/questionEngine';
import confetti from 'canvas-confetti';
import { PlacementTips } from '../../components/PlacementTips';
import { LevelUpBanner, StreakBadge } from '../../components/ProgressionSystem';

const COMM_TOPICS = ['All', 'Extempore', 'Pitch', 'Debate', 'Negotiation'];

export function Communication() {
  const { user, refreshProfile, profile } = useAuth();
  const location = useLocation();
  const sessionType = location.state?.sessionType || null;

  const [selectedTopic, setSelectedTopic] = useState('All');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isRatingPhase, setIsRatingPhase] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Intermediate');
  const [prevDifficulty, setPrevDifficulty] = useState<Difficulty>('Intermediate');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [isReset, setIsReset] = useState(false);

  const [fluency, setFluency] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [confidence, setConfidence] = useState(5);

  useEffect(() => {
    const fetchPrompts = async (topic: string) => {
      setIsLoading(true);
      try {
        let difficulty = await getAdaptiveDifficulty(user?.id || '', 'communication');
        const finalDifficulty: Difficulty = sessionType === 'challenge' ? 'Expert' : difficulty;
        setCurrentDifficulty(finalDifficulty);
        setPrevDifficulty(finalDifficulty);

        const categoryParam = topic === 'All' ? undefined : topic;
        const result = await fetchSmartQuestions(user?.id || '', 'communication', finalDifficulty, 6, categoryParam);
        if (result.isReset) {
          toast('🔄 You\'ve practiced all prompts! A fresh set is ready.', { duration: 4000 });
        }
        setIsReset(result.isReset);
        setPrompts(result.questions);
      } catch (err: any) {
        console.error('Comm Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompts(selectedTopic);
  }, [user, sessionType, selectedTopic]);

  useEffect(() => {
    if (sessionType && !selectedPrompt && prompts.length > 0 && !isLoading) {
      const idx = Math.floor(Math.random() * prompts.length);
      setSelectedPrompt(prompts[idx]);
    }
  }, [sessionType, prompts, isLoading, selectedPrompt]);

  const startRating = () => setIsRatingPhase(true);

  const submitEvaluation = async () => {
    setSessionCompleted(true);
    if (user?.id && selectedPrompt) {
      const overall = Math.round(((fluency + clarity + confidence) / 30) * 100);
      const xp = calculateXP(currentDifficulty, overall);
      setSessionXP(prev => prev + xp);
      try {
        await databaseService.saveCommunicationScore({
          user_id: user.id,
          prompt: selectedPrompt.question_text,
          fluency_rating: fluency,
          clarity_rating: clarity,
          confidence_rating: confidence,
          overall_score: overall
        });
        if (overall >= 80) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        await databaseService.markQuestionsAsSeen(user.id, [selectedPrompt.id]);
        await refreshProfile();
        window.dispatchEvent(new CustomEvent('ace-score-updated'));

        // Check level-up
        const newDifficulty = await getAdaptiveDifficulty(user.id, 'communication');
        if (newDifficulty !== currentDifficulty && newDifficulty !== 'Beginner') {
          setPrevDifficulty(currentDifficulty);
          setCurrentDifficulty(newDifficulty);
          setTimeout(() => setShowLevelUp(true), 800);
        }
      } catch (err) { console.error('Comm score saving failed'); }
    }
  };

  const resetState = () => {
    setSelectedPrompt(null);
    setIsRatingPhase(false);
    setSessionCompleted(false);
    setFluency(5);
    setClarity(5);
    setConfidence(5);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64 text-amber-500 font-black uppercase tracking-[0.5em] animate-pulse">Loading Communication Session...</div>;

  if (sessionCompleted) {
    const overall = Math.round(((fluency + clarity + confidence) / 30) * 100);
    return (
      <>
      <div className="pb-20 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-16 w-full relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          
          <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <Sparkles className="w-12 h-12 text-amber-400" />
          </div>

          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase leading-none">
              Session <span className="text-wow italic px-4">Complete!</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-4">Your speaking scores have been saved.</p>

          {sessionXP > 0 && (
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl mb-10">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-600">+{sessionXP} XP Earned!</span>
            </div>
          )}

          <div className="bg-amber-600 text-white rounded-[3rem] p-12 mb-12 shadow-2xl shadow-amber-500/30">
            <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-4">Communication Score</p>
            <p className="text-8xl font-black tracking-tighter leading-none">{overall}%</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Fluency', val: fluency },
              { label: 'Clarity', val: clarity },
              { label: 'Confidence', val: confidence }
            ].map((m, i) => (
              <div key={i} className="glass bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border-white dark:border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
                <p className="text-3xl font-[900] text-slate-900 dark:text-white">{m.val}/10</p>
              </div>
            ))}
          </div>

          {overall >= 80 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 mb-12 text-center text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tight">
               <ShieldCheck className="w-6 h-6 inline-block mr-3 -mt-1" /> Excellent communication! Keep up this level of clarity and confidence.
            </div>
          ) : (
             <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 mb-12 text-center text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tight">
               <Activity className="w-6 h-6 inline-block mr-3 -mt-1" /> Keep practicing daily — consistency is the key to strong communication skills.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button type="button" onClick={resetState} className="btn-wow px-12 py-6 scale-110 flex items-center gap-4">
              <RotateCcw className="w-5 h-5" /> NEXT PROMPT
            </button>
            <Link to="/practice" className="px-12 py-6 glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white dark:text-white transition-all flex items-center gap-4">
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

  if (selectedPrompt) {
    return (
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in px-6 pb-20">
        <button type="button" onClick={resetState} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-4">
          <ArrowRight className="w-5 h-5 rotate-180" /> CLOSE SESSION
        </button>

        <motion.div 
          layout
          className="glass-premium p-6 md:p-12 lg:p-24 shadow-2xl relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
        >
          <div className="absolute top-0 right-0 p-16 opacity-5">
             <MessageSquare className="w-80 h-80 text-amber-500" />
          </div>

          <div className="flex items-center gap-6 mb-16 relative z-10">
            <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Scenario: {selectedPrompt.category || 'Speech Practice'}</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Speech Buffer</p>
            </div>
          </div>
          
          <div className="p-8 md:p-16 glass bg-slate-950 text-white rounded-[2rem] md:rounded-[3rem] mb-20 relative z-10 italic">
            <Quote className="absolute -top-6 -left-6 w-16 h-16 text-white/10" />
            <p className="text-3xl md:text-5xl lg:text-6xl font-[900] leading-tight tracking-tight text-center">
              "{selectedPrompt.question_text}"
            </p>
          </div>

          {!isRatingPhase ? (
            <div className="flex flex-col items-center py-10 relative z-10">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }} 
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 bg-amber-500/20 border-4 border-amber-500/40 rounded-full flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(245,158,11,0.2)]"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-full animate-pulse flex items-center justify-center shadow-2xl shadow-amber-500/50">
                    <Mic className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 text-center mb-16 max-w-xl font-medium italic leading-relaxed">
                Execute your narrative. Avoid fillers. Focus on <span className="text-amber-500 font-black">Resonance</span> and <span className="text-indigo-500 font-black">Clarity</span>.
              </p>
              
              <button 
                type="button"
                onClick={startRating} 
                className="btn-wow px-8 py-4 sm:px-16 sm:py-6 sm:scale-110 flex items-center justify-center gap-4 w-full sm:w-auto"
              >
                <CheckCircle className="w-6 h-6" /> COMPLETE SIMULATION
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="py-10 space-y-16 relative z-10"
            >
               <div className="flex items-center gap-6 pb-10 border-b border-white/10">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sliders className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Diagnostic Self-Audit</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { label: 'Fluency', val: fluency, set: setFluency, color: 'accent-amber-500' },
                    { label: 'Clarity', val: clarity, set: setClarity, color: 'accent-indigo-500' },
                    { label: 'Confidence', val: confidence, set: setConfidence, color: 'accent-rose-500' },
                  ].map((m, i) => (
                    <div key={i} className="glass bg-white dark:bg-white/5 p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-white/60 dark:border-white/10 flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">{m.label}</p>
                      <div className="text-5xl md:text-6xl font-[900] text-slate-900 dark:text-white mb-10 tabular-nums">
                        {m.val}
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={m.val} 
                        onChange={(e) => m.set(Number(e.target.value))} 
                        className={`w-full h-3 bg-slate-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer ${m.color}`} 
                      />
                    </div>
                  ))}
               </div>

               <div className="flex justify-center pt-10">
                 <button 
                  type="button"
                  onClick={submitEvaluation} 
                  className="btn-wow px-8 py-4 sm:px-20 sm:py-8 sm:scale-110 flex items-center justify-center gap-6 w-full sm:w-auto"
                 >
                    SYNCHRONIZE SESSION <Zap className="w-8 h-8 fill-current" />
                 </button>
               </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto animate-fade-in space-y-16 pb-32 pt-6 px-6">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-16 border-b border-amber-500/10 pb-20">
        <div className="space-y-6">
          <div className="badge-premium bg-amber-50 text-amber-600 dark:bg-white/5 dark:text-amber-400 inline-block">
               COMMUNICATION TRAINING HUB
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-slate-900 dark:text-white leading-[1.1] md:leading-[0.85] tracking-tighter uppercase italic">
               Refine Your <br />
               <span className="text-wow px-4">Professional Voice.</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
               Expert-led speaking assessments designed to enhance your conversational clarity and professional presence.
          </p>
        </div>
        <div className="glass-card p-10 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
             <Activity className="w-5 h-5 text-amber-500" /> Waveform Active
           </p>
           <div className="flex items-end gap-1 h-8">
              {[0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.2, 0.6, 0.4].map((h, i) => (
                <motion.div key={i} animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.1 }} className="w-1.5 bg-amber-500 rounded-full" />
              ))}
           </div>
        </div>
      </motion.div>

      <div className="flex justify-center mb-6 px-2">
        <button 
          onClick={() => setShowTips(true)}
          className="flex items-center justify-center gap-3 px-6 py-4 md:px-8 md:py-4 w-full sm:w-auto bg-white dark:bg-white/5 border border-amber-100 dark:border-white/10 rounded-2xl text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest hover:bg-amber-50 transition-all shadow-xl text-center"
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" /> View Communication Tips & Common Mistakes
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {COMM_TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              selectedTopic === topic
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'glass bg-white/60 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {prompts.map((p, idx) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedPrompt(p)}
            className="glass-card group flex flex-col transition-all cursor-pointer hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(245,158,11,0.2)] bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 h-full overflow-hidden"
          >
            <div className="p-12 flex-grow space-y-10">
               <div className="flex justify-between items-center">
                  <div className="badge-premium bg-slate-950 text-white group-hover:bg-amber-600 transition-colors">
                     DOMAIN: {p.category || 'Speech'}
                  </div>
                  <Mic className="w-8 h-8 text-slate-300 dark:text-slate-700 opacity-20 group-hover:opacity-100 group-hover:text-amber-500 transition-all" />
               </div>
               <p className="text-3xl text-slate-900 dark:text-white font-[900] leading-tight tracking-tight group-hover:italic transition-all">
                 "{p.question_text}"
               </p>
            </div>
            <div className="px-12 py-8 bg-slate-950 text-white flex items-center justify-between group-hover:bg-amber-600 transition-all">
               <span className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4">
                  Request Speech Batch <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
               </span>
               <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20">
                  <Activity className="w-5 h-5 text-amber-400 group-hover:text-white" />
               </div>
            </div>
          </motion.div>
        ))}
        {prompts.length === 0 && !isLoading && (
          <div className="col-span-full py-40 border-4 border-dashed border-slate-200 dark:border-white/10 rounded-[4rem] text-center">
             <Info className="w-16 h-16 text-slate-300 mx-auto mb-6" />
             <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Active Prompts in Buffer</p>
          </div>
        )}
      </div>
      <PlacementTips category="communication" isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
}
