import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Mail, Send, CheckCircle, RotateCcw, 
  ArrowRight, Info, Sparkles, MessageSquare,
  ChevronRight, FileText, AlertCircle, Bookmark
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { databaseService } from '../../services/databaseService';
import confetti from 'canvas-confetti';
import { PlacementTips } from '../../components/PlacementTips';

const EMAIL_SCENARIOS = [
  {
    id: 1,
    title: 'Post-Interview Follow-up',
    desc: 'Write an email thanking the interviewer and reinforcing your interest.',
    prompt: 'You just finished an interview for a Software Engineer role at a top firm. Write a professional thank-you email to the hiring manager.',
    difficulty: 'Intermediate'
  },
  {
    id: 2,
    title: 'Referral Request',
    desc: 'Ask an alum or professional contact for a job referral.',
    prompt: 'You found a job opening at a company where an alum from your college works. Write a polite email asking for a referral.',
    difficulty: 'Advanced'
  },
  {
    id: 3,
    title: 'Internship Application',
    desc: 'A cold email to a manager for an internship opportunity.',
    prompt: 'You are interested in a summer internship at a boutique design firm. Write an introductory email attaching your portfolio.',
    difficulty: 'Beginner'
  },
  {
    id: 4,
    title: 'Accepting a Job Offer',
    desc: 'Formally accept a job offer and confirm the next steps.',
    prompt: 'You received a job offer letter. Write a professional acceptance email confirming your start date and expressing excitement.',
    difficulty: 'Beginner'
  }
];

export function EmailWriting() {
  const { user, refreshProfile } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [emailText, setEmailText] = useState('');
  const [subject, setSubject] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [showTips, setShowTips] = useState(false);

  const evaluateEmail = async () => {
    if (!emailText.trim() || !subject.trim()) {
      toast.error("Please provide both a subject and the email body.");
      return;
    }
    setIsEvaluating(true);
    
    // Heuristic-based professional evaluation
    let score = 40;
    const feedback: string[] = [];
    
    // Subject line checks
    if (subject.length > 5 && subject.length < 60) score += 15;
    else feedback.push("Improve subject line clarity.");

    // Formal salutation checks
    const salutations = ['dear', 'hello', 'greetings', 'respectfully'];
    if (salutations.some(s => emailText.toLowerCase().includes(s))) score += 15;
    else feedback.push("Use a formal salutation (e.g., 'Dear [Name]').");

    // Professional sign-off checks
    const signoffs = ['sincerely', 'best regards', 'thank you', 'thanks', 'kind regards'];
    if (signoffs.some(s => emailText.toLowerCase().includes(s))) score += 15;
    else feedback.push("Add a professional sign-off.");

    // Length check
    const words = emailText.trim().split(/\s+/).length;
    if (words > 40 && words < 250) score += 15;
    else if (words < 40) feedback.push("The email is too short; add more context.");
    else feedback.push("The email is a bit long; keep it concise.");

    score = Math.min(100, score);
    
    const evalData = {
      score,
      feedback: feedback.length > 0 ? feedback[0] : "Excellent structure and professional tone.",
      tips: feedback
    };

    setEvaluation(evalData);
    
    if (score >= 80) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    if (user?.id) {
      try {
        await databaseService.saveCommunicationScore({
          user_id: user.id,
          prompt: `Email: ${selectedScenario.title}`,
          fluency_rating: Math.ceil(score/10),
          clarity_rating: Math.ceil(score/10),
          confidence_rating: 8,
          overall_score: score
        });
        await refreshProfile();
      } catch (err) { console.error('Email score saving failed'); }
    }
    setIsEvaluating(false);
  };

  const reset = () => {
    setSelectedScenario(null);
    setEmailText('');
    setSubject('');
    setEvaluation(null);
  };

  if (evaluation) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 animate-fade-in text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-premium p-8 md:p-12 lg:p-20 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">Evaluation <span className="text-wow italic">Complete.</span></h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">Your professional email has been analyzed for impact and etiquette.</p>
          
          <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-12 mb-12 shadow-2xl shadow-indigo-500/30">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Professionalism Index</p>
            <p className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{evaluation.score}%</p>
          </div>

          <div className="p-8 glass bg-white dark:bg-white/5 border-white dark:border-white/10 rounded-[2.5rem] mb-12 text-left">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Writing Insight
            </h4>
            <p className="text-xl font-bold italic text-slate-800 dark:text-slate-200">"{evaluation.feedback}"</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button onClick={reset} className="btn-wow px-6 py-4 md:px-12 md:py-5 w-full sm:w-auto justify-center sm:scale-110 flex items-center gap-4">
              <RotateCcw className="w-5 h-5" /> TRY ANOTHER
            </button>
            <Link to="/communication" className="px-6 py-4 md:px-12 md:py-5 w-full sm:w-auto justify-center text-center glass border-white/60 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white dark:text-white transition-all flex items-center gap-4">
              COMMUNICATION HUB <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (selectedScenario) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in space-y-10">
        <div className="flex justify-between items-center">
          <button onClick={() => setSelectedScenario(null)} className="text-slate-400 hover:text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-4 transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" /> BACK TO SCENARIOS
          </button>
          <button onClick={() => setShowTips(true)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest hover:underline">
            <Info className="w-4 h-4" /> View Email Tips
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 bg-indigo-600 text-white border-transparent">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{selectedScenario.title}</h3>
              <p className="text-indigo-100 font-medium leading-relaxed italic">"{selectedScenario.prompt}"</p>
            </div>
            <div className="glass-card p-8 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Etiquette Checklist</h4>
              <ul className="space-y-4">
                {[
                  'Clear Subject Line',
                  'Professional Salutation',
                  'Concise Body Content',
                  'Polite Closing'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="glass-premium p-1 bg-white/60 dark:bg-slate-950/40 border-white/60 dark:border-white/10 overflow-hidden">
               <div className="px-8 py-4 border-b border-white/10 flex items-center gap-4 bg-slate-50 dark:bg-white/5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject:</span>
                  <input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter your subject line..."
                    className="flex-grow bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
               </div>
               <textarea 
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Draft your professional email here..."
                  className="w-full h-[500px] p-8 bg-transparent text-slate-900 dark:text-white text-lg font-medium leading-relaxed outline-none resize-none"
               />
            </div>
            
            <div className="flex justify-center sm:justify-end">
              <button 
                onClick={evaluateEmail}
                disabled={isEvaluating || emailText.length < 20}
                className="btn-wow px-8 py-4 sm:px-16 sm:py-6 sm:scale-110 w-full sm:w-auto justify-center disabled:opacity-30 disabled:scale-100 flex items-center gap-4"
              >
                {isEvaluating ? 'Evaluating Etiquette...' : 'Submit Draft'} <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <PlacementTips category="email" isOpen={showTips} onClose={() => setShowTips(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto animate-fade-in space-y-16 pb-32 pt-6 px-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-16 border-b border-indigo-500/10 pb-20">
        <div className="space-y-6">
          <div className="badge-premium bg-indigo-50 text-indigo-600 dark:bg-white/5 dark:text-indigo-400 inline-block">
               PROFESSIONAL WRITING HUB
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-slate-900 dark:text-white leading-[1.1] md:leading-[0.85] tracking-tighter uppercase italic">
               Master Your <br />
               <span className="text-wow px-4">Business Email.</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
               Practice high-impact professional correspondence with real-time etiquette analysis.
          </p>
        </div>
        <div className="glass-card p-10 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hidden md:block">
           <FileText className="w-12 h-12 text-indigo-600 mb-4" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scenarios: 04</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {EMAIL_SCENARIOS.map((s) => (
          <motion.div 
            key={s.id}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedScenario(s)}
            className="glass-card group p-10 cursor-pointer flex flex-col justify-between h-full bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10"
          >
            <div>
               <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-indigo-50 dark:bg-white/5 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.difficulty}</span>
               </div>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter group-hover:italic transition-all">{s.title}</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{s.desc}</p>
            </div>
            <div className="mt-10 flex items-center gap-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group-hover:gap-5 transition-all">
               Start Drafting <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
