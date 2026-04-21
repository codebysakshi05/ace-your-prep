import { useState, useEffect } from 'react';
import { 
  Video, ChevronRight, PenTool, RotateCcw, 
  HelpCircle, Star, ArrowRight, Quote, Activity, Target, ShieldCheck, Building2, Sparkles, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { getAdaptiveDifficulty } from '../../utils/adaptiveLearning';
import { databaseService } from '../../services/databaseService';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { COMPANY_BENCHMARKS } from '../../constants/benchmarks';

export function Interview() {
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const sessionType = location.state?.sessionType || null;
  const [questions, setQuestions] = useState<any[]>([]);
  const [targetCompany, setTargetCompany] = useState<any>(
    COMPANY_BENCHMARKS.find(b => b.id === (profile?.target_company || 'google')) || COMPANY_BENCHMARKS[0]
  );
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{ 
    score: number; 
    feedback: string; 
    confidence: number; 
    starBreakdown: any;
    forensics: { clarity: number; tone: number };
  } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        let recommendedDifficulty = await getAdaptiveDifficulty(user?.id || '', 'interview');
        if (sessionType === 'challenge') recommendedDifficulty = 'Expert';

        let { data, error } = await supabase
          .from('module_questions')
          .select('*')
          .eq('module_type', 'interview');
        
        if (error) throw error;
        if (!data) data = [];

        const seenIds = await databaseService.fetchSeenQuestionIds(user?.id || '');
        let pool = data.filter(q => q.difficulty === recommendedDifficulty && !seenIds.includes(q.id));
        if (pool.length < 3) pool = data.filter(q => !seenIds.includes(q.id));
        if (pool.length < 2) pool = data;

        setQuestions(pool);
      } catch (err: any) {
        console.error("Interview Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [user, sessionType]);

  useEffect(() => {
    if (sessionType && !selectedQuestion && questions.length > 0 && !isLoading) {
      const idx = Math.floor(Math.random() * questions.length);
      startQuestion(questions[idx]);
    }
  }, [sessionType, questions, isLoading, selectedQuestion]);

  const startQuestion = (q: any) => {
    setSelectedQuestion(q);
    setAnswer('');
    setEvaluation(null);
    setIsEvaluating(false);
  };

  const evaluateAnswer = async () => {
    if (!answer.trim()) return;
    setIsEvaluating(true);

    let score = 30; 
    const starHeuristics = {
      situation: ['situation', 'context', 'problem', 'background', 'when', 'initial'],
      task: ['task', 'goal', 'objective', 'assigned', 'expectation'],
      action: ['action', 'i did', 'implemented', 'managed', 'executed', 'handled', 'coordinated'],
      result: ['result', 'outcome', 'finally', 'achieved', 'consequently', 'impact', 'delivered']
    };

    const breakdown = {
      S: starHeuristics.situation.some(word => answer.toLowerCase().includes(word)),
      T: starHeuristics.task.some(word => answer.toLowerCase().includes(word)),
      A: starHeuristics.action.some(word => answer.toLowerCase().includes(word)),
      R: starHeuristics.result.some(word => answer.toLowerCase().includes(word))
    };

    const starCount = Object.values(breakdown).filter(Boolean).length;
    score += starCount * 12.5; 

    const words = answer.trim().split(/\s+/);
    if (words.length > 50) score += 10;
    if (words.length > 100) score += 10;

    score = Math.min(100, score);
    const confidence = Math.min(100, 40 + (starCount * 15));
    const clarity = Math.min(100, (answer.length / 200) * 100);
    const tone = words.length > 80 ? 90 : 60;

    const feedback = starCount === 4 ? "Masterful response. Eloquent and structured." : starCount >= 2 ? "Solid contribution. Define S/R more clearly." : "Novice articulation. Use STAR framework.";

    setEvaluation({ score, feedback, confidence, starBreakdown: breakdown, forensics: { clarity, tone } });
    
    if (score >= 80) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    if (user?.id) {
      try {
        await databaseService.saveInterviewScore({ user_id: user.id, question_category: selectedQuestion.category, evaluation_score: score, feedback });
        await refreshProfile();
        window.dispatchEvent(new CustomEvent('ace-score-updated'));
        await databaseService.markQuestionsAsSeen(user.id, [selectedQuestion.id]);
      } catch (err) { console.error('Interview saving failed'); }
    }
    setIsEvaluating(false);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64 text-indigo-500 font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Terminal...</div>;

  if (evaluation && selectedQuestion) {
    if (showReview) {
      return (
        <div className="max-w-7xl mx-auto py-32 animate-fade-in px-6 flex flex-col items-center">
           <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-premium p-12 md:p-20 w-full bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20 border-b border-indigo-500/10 pb-12">
                 <div>
                    <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Forensic Review</h2>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mt-2">Deep Response Decomposition</p>
                 </div>
                 <button onClick={() => setShowReview(false)} className="btn-wow px-10 py-5 scale-110 flex items-center gap-4">
                    <RotateCcw className="w-5 h-5" /> BACK TO VERDICT
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                 <div className="lg:col-span-2 space-y-12">
                    <div className="p-10 glass bg-white dark:bg-white/5 border-white dark:border-white/10 rounded-[3rem]">
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-tighter">
                          <Activity className="w-8 h-8 text-indigo-600" /> Target Assertion
                       </h3>
                       <p className="text-3xl text-slate-400 font-medium leading-tight italic pl-10 border-l-4 border-indigo-500">
                          {selectedQuestion.question_text}
                       </p>
                    </div>

                    <div className="p-10 glass bg-slate-950 text-white rounded-[3rem]">
                       <h3 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">
                          <PenTool className="w-8 h-8 text-rose-500" /> Tactical Transcript
                       </h3>
                       <p className="text-xl text-slate-300 leading-relaxed font-serif italic">
                          "{answer}"
                       </p>
                    </div>
                 </div>

                 <div className="space-y-12">
                    <div className="p-10 glass bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[3rem] shadow-2xl shadow-indigo-500/30">
                       <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Command Evaluation</p>
                       <p className="text-8xl font-black tracking-tighter leading-none">{evaluation.score}%</p>
                       <div className="mt-10 pt-10 border-t border-white/10 uppercase italic">
                          <p className="text-2xl font-bold">{evaluation.score >= targetCompany.thresholds.interview ? 'DOMINANT' : 'STABLE'}</p>
                       </div>
                    </div>

                    <div className="p-10 glass bg-white dark:bg-white/5 border-white dark:border-white/10 rounded-[3rem] space-y-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">STAR SYNC STATUS</h4>
                       {Object.entries(evaluation.starBreakdown).map(([key, val]) => (
                         <div key={key} className="flex items-center justify-between p-5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-white/10">
                            <span className="text-base font-black text-slate-400">{key === 'S' ? 'SITUATION' : key === 'T' ? 'TASK' : key === 'A' ? 'ACTION' : 'RESULT'}</span>
                            <span className={`text-[10px] font-black ${val ? 'text-emerald-500' : 'text-slate-600'}`}>{val ? 'SYNCED' : 'DEVIATED'}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      );
    }

    return (
      <div className="flex justify-center py-40 animate-fade-in px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-premium p-16 max-w-4xl w-full relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
          
          <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <ShieldCheck className="w-12 h-12 text-indigo-400" />
          </div>

          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">
              Verdict <span className="text-wow italic px-4">Rendered.</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">Interview articulation forensics complete.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
             <div className="p-12 glass bg-white dark:bg-white/5 border-white dark:border-white/10 rounded-[3rem]">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Tactical Score</p>
                <p className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{evaluation.score}%</p>
             </div>
             
             <div className="flex flex-col justify-center space-y-8 text-left">
                <div className="p-8 glass bg-indigo-600 text-white rounded-[2.5rem]">
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-300" /> Intelligence Insight
                   </p>
                   <p className="text-xl font-bold italic leading-relaxed">
                     "{evaluation.feedback}"
                   </p>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Buffer</p>
                    <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${evaluation.confidence}%`}} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                    </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <button onClick={() => setSelectedQuestion(null)} className="btn-wow px-12 py-5 scale-110 flex items-center gap-4">
                <RotateCcw className="w-5 h-5" /> RE-ENGAGE
             </button>
             <button onClick={() => setShowReview(true)} className="px-12 py-5 glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white dark:text-white transition-all">
                FORENSIC BREAKDOWN
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (selectedQuestion) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-12 animate-fade-in px-6 pb-20">
        <button onClick={() => setSelectedQuestion(null)} className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-4">
          <ArrowRight className="w-5 h-5 rotate-180" /> CLOSE CONSOLE
        </button>

        <motion.div 
          layout
          className="glass-premium p-16 md:p-24 shadow-2xl relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-3 bg-slate-100 dark:bg-white/5" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 gap-10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-500/30">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Dispatch: {selectedQuestion.category}</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Simulating: {targetCompany.name} Target</h3>
                </div>
             </div>
             <div className="badge-premium bg-emerald-500/10 text-emerald-600 dark:bg-white/5 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Audio Stream Secure
             </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl text-slate-900 dark:text-white font-[900] mb-20 leading-tight tracking-[ -0.05em]">
            "{selectedQuestion.question_text}"
          </h2>

          <div className="space-y-10">
             <textarea
               value={answer}
               onChange={(e) => setAnswer(e.target.value)}
               placeholder="Initiate your professional narrative..."
               className="w-full h-96 bg-white dark:bg-slate-950/40 border border-white/60 dark:border-white/5 rounded-[3rem] p-12 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-3xl font-medium leading-relaxed italic"
             ></textarea>

             <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pt-10 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-wrap items-center gap-6">
                   <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                      <Building2 className="w-5 h-5 text-indigo-500" />
                      <select 
                        value={targetCompany.id}
                        onChange={(e) => setTargetCompany(COMPANY_BENCHMARKS.find(b => b.id === e.target.value)!)}
                        className="bg-transparent text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest outline-none"
                      >
                        {COMPANY_BENCHMARKS.map(b => (
                          <option key={b.id} value={b.id} className="bg-slate-900">{b.name} THRESHOLD</option>
                        ))}
                      </select>
                   </div>
                   <div className="badge-premium dark:bg-white/5 text-slate-500">
                      Response Load: {answer.length} CHARS
                   </div>
                </div>
                
                <button 
                  onClick={evaluateAnswer}
                  disabled={isEvaluating || answer.trim().length < 20}
                  className="btn-wow px-16 py-6 scale-125 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-4"
                >
                  {isEvaluating ? 'ANALYZING DNA...' : 'RENDER VERDICT'} <ArrowRight className="w-6 h-6" />
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto animate-fade-in space-y-16 pb-32 pt-6 px-6">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-16 border-b border-indigo-500/10 pb-20">
        <div className="space-y-6">
          <div className="badge-premium bg-indigo-50 text-indigo-600 dark:bg-white/5 dark:text-indigo-400 inline-block">
               Neural Simulation Node: Interview Terminal
          </div>
          <h1 className="text-7xl md:text-9xl font-[900] text-slate-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
               Master the <br />
               <span className="text-wow px-4">Art of War.</span>
          </h1>
          <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
               Forensic interview assessments with real-time articulation analysis and enterprise-standard threshold tracking.
          </p>
        </div>
        <div className="glass-card p-10 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adaptive complexity</p>
           <div className="flex gap-4">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <div className="w-4 h-4 rounded-full bg-amber-500 opacity-20" />
              <div className="w-4 h-4 rounded-full bg-rose-500 opacity-20" />
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {questions.map((q, idx) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => startQuestion(q)}
            className="glass-card group flex flex-col transition-all cursor-pointer hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.2)] bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 h-full"
          >
            <div className="p-12 flex-grow space-y-10">
               <div className="flex justify-between items-center">
                  <div className="badge-premium bg-slate-950 text-white group-hover:bg-indigo-600 transition-colors">
                     SECTION: {q.category}
                  </div>
                  <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 opacity-20 group-hover:opacity-100 group-hover:text-indigo-600 transition-all" />
               </div>
               <p className="text-3xl text-slate-900 dark:text-white font-[900] leading-tight tracking-tight group-hover:italic transition-all">
                 "{q.question_text}"
               </p>
            </div>
            <div className="px-12 py-8 bg-slate-950 text-white flex items-center justify-between group-hover:bg-indigo-600 transition-all">
               <span className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4">
                  Request Simulation <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
               </span>
               <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20">
                  <Building2 className="w-5 h-5 text-indigo-400 group-hover:text-white" />
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
