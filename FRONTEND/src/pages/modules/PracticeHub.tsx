import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Video, MessageSquare, Users, Zap, Target, 
  Trophy, ChevronRight, Sparkles, Clock, 
  Activity, TrendingUp, AlertTriangle, FileText, Award,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../services/databaseService';
import { AceSessionStart } from '../../components/AceProtocol';

const SESSION_TYPES = [
  {
    id: 'quick',
    name: 'Quick Practice',
    desc: '5 questions — great for a fast warm-up session.',
    duration: '5 min',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    id: 'sprint',
    name: 'Daily Sprint',
    desc: '15 mixed-difficulty questions to build consistency.',
    duration: '15 min',
    icon: Activity,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    id: 'challenge',
    name: 'Mock Placement Test',
    desc: '20 hard questions simulating real placement rounds.',
    duration: '20 min',
    icon: Trophy,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    id: 'focus',
    name: 'Weak Area Practice',
    desc: 'Automatically targets your lowest-scoring topic.',
    duration: 'Adaptive',
    icon: Target,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  }
];

const MODULE_CARDS = [
  { id: 'aptitude', name: 'Aptitude Training', desc: 'Quantitative, Logical & Verbal Reasoning', path: '/aptitude', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'interview', name: 'Interview Preparation', desc: 'HR & Technical interview questions', path: '/interview', icon: Video, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'communication', name: 'Communication Skills', desc: 'Speaking, fluency & confidence practice', path: '/communication', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'email', name: 'Email Writing', desc: 'Professional correspondence & etiquette', path: '/email-writing', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'gd', name: 'GD Practice', desc: 'Timed discussion topics with scoring', path: '/gd-practice', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'resume', name: 'Resume Builder', desc: 'Professional resume creation & export', path: '/resume-builder', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' }
];

export function PracticeHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{ type: string; path: string; name: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) { setLoading(false); return; }
      try {
        const [insightData, statsData] = await Promise.all([
          databaseService.fetchPerformanceInsights(user.id),
          databaseService.fetchUserStats(user.id),
        ]);
        setInsight(insightData);
        setStats(statsData);
      } catch (err) {
        console.error('PracticeHub load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleStartSession = (type: string, moduleId?: string) => {
    let path = '/aptitude';
    
    if (moduleId) {
      const module = MODULE_CARDS.find(m => m.id === moduleId);
      path = module ? module.path : `/${moduleId}`;
    } else if (insight?.weakest?.route) {
      path = insight.weakest.route;
    }

    const sessionName = SESSION_TYPES.find(s => s.id === type)?.name || 'Standard';
    setSelectedSession({ type, path, name: sessionName });
    setIsInitializing(true);
  };

  const handleInitializationComplete = () => {
    if (selectedSession) {
      navigate(selectedSession.path, { state: { sessionType: selectedSession.type } });
    }
    setIsInitializing(false);
  };

  const getScoreForModule = (moduleId: string) => {
    if (!stats) return null;
    const map: Record<string, number> = {
      aptitude: stats.aptitude,
      interview: stats.interview,
      communication: stats.communication,
      gd: stats.gd,
      email: stats.communication // Mapping email to communication stats for now
    };
    return map[moduleId] ?? null;
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-indigo-500 font-black animate-pulse uppercase tracking-widest">Loading Practice Environment...</div>;

  return (
    <div className="max-w-[1700px] mx-auto space-y-16 pb-32 pt-6 px-6 animate-fade-in">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-16 border-b border-indigo-500/10 pb-20">
        <div className="space-y-6">
          <div className="badge-premium bg-primary/10 text-primary border-primary/20 inline-block">
               PLACEMENT PREPARATION HUB
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-slate-900 dark:text-white leading-[1.1] md:leading-[0.85] tracking-tighter uppercase italic">
               Hone Your <br />
               <span className="text-wow italic px-2">Placement Edge.</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
               Expert-designed practice modules to sharpen your technical and professional skills for top-tier recruitment.
          </p>
        </div>
        
        <div className="glass-card p-10 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hidden md:block min-w-[300px] shadow-2xl">
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Placement Readiness</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">84%</p>
           </div>
           <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 2, ease: "easeOut" }} className="h-full bg-indigo-600 rounded-full" />
           </div>
        </div>
      </div>

      {/* ── Smart Recommendation Panel ── */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-premium p-10 border-2 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden transition-all duration-500 hover:scale-[1.01] ${
              insight.weakest.score < 50 
                ? 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 shadow-rose-500/10' 
                : 'bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20 shadow-indigo-500/10'
            } shadow-2xl`}
          >
            <div className={`p-8 rounded-[2rem] shrink-0 shadow-2xl ${insight.weakest.score < 50 ? 'bg-rose-600 text-white shadow-rose-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
              {insight.weakest.score < 50 
                ? <AlertTriangle className="w-8 h-8" />
                : <TrendingUp className="w-8 h-8" />
              }
            </div>
            <div className="relative z-10 flex-grow text-center md:text-left">
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-3 ${insight.weakest.score < 50 ? 'text-rose-600' : 'text-indigo-600'}`}>Recommended Priority</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{insight.missionTitle}</h3>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-8 italic">"{insight.recommendation}"</p>
              <button
                onClick={() => handleStartSession('focus')}
                className="btn-wow px-6 py-4 md:px-10 md:py-5 w-full md:w-auto text-xs font-black uppercase tracking-widest justify-center"
              >
                Focus on this area <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden lg:block opacity-5">
               <Sparkles className="w-40 h-40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Session Modes ── */}
      <section>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Select Session Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SESSION_TYPES.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => handleStartSession(session.id)}
              className="glass-card bg-white/60 dark:bg-white/5 p-8 md:p-12 flex flex-col justify-between group cursor-pointer border-white/60 dark:border-white/10 shadow-2xl h-full transition-all duration-500"
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                  <div className={`p-5 rounded-[1.5rem] ${session.bg} ${session.color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                    <session.icon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/10 uppercase tracking-widest">
                    {session.duration}
                  </span>
                </div>
                <h3 className="text-2xl font-[900] text-slate-900 dark:text-white mb-4 uppercase tracking-tighter group-hover:italic transition-all">{session.name}</h3>
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12">{session.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] group-hover:gap-5 transition-all">
                Launch Training Session <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Training Modules Grid ── */}
      <section>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Specific Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MODULE_CARDS.map((module) => {
            const score = getScoreForModule(module.id);
            const isWeak = insight?.weakest?.id === module.id;
            return (
              <Link
                key={module.id}
                to={module.path}
                className={`glass-card p-8 md:p-12 flex flex-col transition-all group hover:-translate-y-4 bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 h-full relative overflow-hidden ${
                  isWeak ? 'ring-2 ring-rose-500 shadow-3xl shadow-rose-500/10' : 'hover:shadow-indigo-500/10'
                }`}
              >
                <div className="space-y-10 flex-grow">
                   <div className="flex justify-between items-center">
                      <div className={`w-20 h-20 rounded-[2.2rem] ${module.bg} flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                        <module.icon className={`w-10 h-10 ${module.color}`} />
                      </div>
                      {isWeak && (
                        <div className="badge-premium bg-rose-600 text-white shadow-xl shadow-rose-500/30">
                          PRIORITY
                        </div>
                      )}
                   </div>
                   
                   <div>
                      <h3 className="text-3xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter mb-3 leading-none group-hover:italic transition-all">{module.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{module.desc}</p>
                   </div>

                   {score !== null && (
                      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-end">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Level</p>
                           <p className={`text-xl font-black ${score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{score}%</p>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          />
                        </div>
                      </div>
                   )}
                </div>
                
                <div className="mt-12 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                   Enter Module <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Session Loading Overlay ── */}
      <AceSessionStart 
        isOpen={isInitializing} 
        onComplete={handleInitializationComplete} 
        sessionName={selectedSession?.name || 'Standard'}
      />
    </div>
  );
}
