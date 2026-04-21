import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Video, MessageSquare, Users, Zap, Target, 
  Trophy, ChevronRight, Sparkles, Clock, 
  Activity, TrendingUp, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../services/databaseService';

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
  { id: 'aptitude', name: 'Aptitude', desc: 'Quant, Logical & Verbal', path: '/aptitude', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'interview', name: 'Interview', desc: 'HR & Technical questions', path: '/interview', icon: Video, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'communication', name: 'Communication', desc: 'Speaking & fluency practice', path: '/communication', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'gd', name: 'Group Discussion', desc: 'Timed topics with scoring', path: '/gd-practice', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' }
];

export function PracticeHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    const targetModule = moduleId || insight?.weakest?.id || 'aptitude';
    const path = targetModule === 'gd' ? '/gd-practice' : `/${targetModule}`;
    navigate(path, { state: { sessionType: type } });
  };

  const getScoreForModule = (moduleId: string) => {
    if (!stats) return null;
    const map: Record<string, number> = {
      aptitude: stats.aptitude,
      interview: stats.interview,
      communication: stats.communication,
      gd: stats.gd,
    };
    return map[moduleId] ?? null;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-fade-in px-4">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Practice Hub</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Start Practicing</h1>
          <p className="text-slate-500 text-base font-medium max-w-xl">
            Choose a session type below. Your questions are selected based on your past performance so you always practice the right things.
          </p>
        </div>

        {/* ── Smart Recommendation Panel ── */}
        <AnimatePresence>
          {!loading && insight && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-3xl p-6 border-2 flex items-start gap-4 min-w-[280px] max-w-sm relative overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
                insight.weakest.score < 50 
                  ? 'bg-rose-50 border-rose-200 glow-rose shadow-xl shadow-rose-500/10' 
                  : 'bg-indigo-50 border-indigo-200 glow-indigo shadow-xl shadow-indigo-500/10'
              }`}
            >
              <div className="absolute inset-0 shimmer opacity-20 pointer-events-none"></div>
              <div className={`p-4 rounded-2xl shrink-0 shadow-sm ${insight.weakest.score < 50 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {insight.weakest.score < 50 
                  ? <AlertTriangle className="w-6 h-6" />
                  : <TrendingUp className="w-6 h-6" />
                }
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Neural Recommendation</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed mb-4">{insight.recommendation}</p>
                <button
                  onClick={() => handleStartSession('focus', insight.weakest.id)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 group animate-shimmer"
                >
                  Prioritize Practice <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Session Types ── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Choose a Session Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SESSION_TYPES.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ y: -8 }}
              onClick={() => handleStartSession(session.id)}
              className={`bg-white border-2 ${session.border} rounded-[2.5rem] p-8 group cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between ${
                session.id === 'quick' ? 'glow-amber-sm' : 
                session.id === 'challenge' ? 'glow-purple-sm' : 
                session.id === 'focus' ? 'glow-rose-sm' : 'glow-indigo-sm'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${session.bg} ${session.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <session.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {session.duration}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{session.name}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">{session.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.25em] group-hover:gap-4 transition-all">
                Initialize <ChevronRight className="w-4 h-4 translate-y-[1px]" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Module Cards with Scores ── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Practice by Module</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULE_CARDS.map((module) => {
            const score = getScoreForModule(module.id);
            const isWeak = insight?.weakest?.id === module.id;
            return (
              <Link
                key={module.id}
                to={module.path}
                className={`bg-white border rounded-2xl p-6 group hover:shadow-md transition-all flex items-center justify-between ${
                  isWeak ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${module.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className={`w-7 h-7 ${module.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-black text-slate-900">{module.name}</h3>
                      {isWeak && (
                        <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Needs Work
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{module.desc}</p>
                    {score !== null && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Avg: {score}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all text-slate-400 group-hover:text-white shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
