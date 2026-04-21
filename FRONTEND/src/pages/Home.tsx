import { Link } from 'react-router-dom';
import { 
  ArrowRight, Brain, Users, MessageSquare, Video, 
  Sparkles, Shield, Globe,
  Target, TrendingUp, LayoutDashboard, Activity, Zap
} from 'lucide-react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

const MODULES = [
  { 
    title: 'Aptitude Practice', 
    desc: 'Quantitative, Logical, and Verbal questions with timed sessions and instant scoring.', 
    icon: Brain, 
    badge: 'Most Popular'
  },
  { 
    title: 'Interview Preparation', 
    desc: 'HR and technical interview questions with AI-powered STAR method feedback.', 
    icon: Video, 
    badge: 'Top Rated'
  },
  { 
    title: 'Communication Skills', 
    desc: 'Speaking prompts with self-assessment for fluency, clarity, and confidence.', 
    icon: MessageSquare, 
    badge: 'Essential'
  },
  { 
    title: 'Group Discussion', 
    desc: 'Timed discussion topics with structured evaluation for your GD skills.', 
    icon: Users, 
    badge: 'New'
  }
];

const STATS = [
  { value: '500+', label: 'Practice Questions' },
  { value: '4', label: 'Training Modules' },
  { value: 'Real-time', label: 'Score Tracking' },
  { value: 'Adaptive', label: 'Difficulty Engine' },
];

export function Home() {
  const { profile, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await databaseService.fetchResources();
      } catch (err) {
        console.error("Failed to load resources:", err);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="w-full bg-background min-h-screen text-slate-800 selection:bg-indigo-500/10 transition-colors duration-700">
      
      {/* 🚀 ULTIMATE HERO (PHASE 2) */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 bg-hero-liquid overflow-hidden">
        {/* Animated Particles/Orbs */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[700px] h-[700px] bg-rose-500/10 rounded-full blur-[160px] animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-10 xl:gap-16 items-center relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="space-y-10 text-left relative z-20"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-md dark:bg-white/5 dark:border-white/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Sparkles className="w-4 h-4" /> The Enterprise Intelligence Platform
            </motion.div>

            <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[4rem] xl:text-[5rem] font-[900] leading-[1.05] tracking-tight text-slate-900 dark:text-white flex flex-col items-start relative z-30 drop-shadow-xl">
              <span>Ace Your Placement.</span>
              <span className="whitespace-nowrap flex items-center relative z-30">
                <span className="text-wow italic pr-2">Weaponize</span>
                Intelligence.
              </span>
            </h1>

            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
              A high-velocity training suite for the elite 1%. Practice Aptitude, GD, and AI-Powered Interviews with forensic-level feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-wow group scale-110 shadow-indigo-500/20 px-10 py-5 flex items-center justify-center gap-3">
                    Tactical Dashboard <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </Link>
                  <Link to="/practice" className="flex items-center justify-center gap-4 px-10 py-5 glass border-white/40 text-slate-600 dark:text-white dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all">
                    Launch Hub <Activity className="w-5 h-5 text-indigo-400" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-wow group scale-110 shadow-indigo-500/20 px-10 py-5 flex items-center justify-center gap-3">
                    Start Training Now <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link to="/login" className="flex items-center justify-center gap-4 px-10 py-5 glass border-white/40 text-slate-600 dark:text-white dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-200 dark:border-white/5">
              {STATS.map((s, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{s.value}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3D Dashboard Preview (Framer Masterpiece) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="hidden lg:block relative perspective-1000"
          >
            <div className="glass-premium p-10 shadow-[0_80px_120px_-20px_rgba(99,102,241,0.25)] relative group">
              <div className="flex justify-between items-center mb-10">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                </div>
                <div className="badge-premium bg-emerald-500/10 text-emerald-600">
                  Forensics Active
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-slate-900/5 dark:bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dominance Index</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">LVL {profile?.level || 12}</p>
                </div>
                <div className="p-6 bg-slate-900/5 dark:bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tactical Streak</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{profile?.streak_count || 8} DAYS</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Aptitude Mastery', score: 88, color: 'from-indigo-500 to-indigo-600' },
                  { label: 'Interview Fluency', score: 94, color: 'from-rose-500 to-rose-600' },
                  { label: 'Market Visibility', score: 76, color: 'from-emerald-500 to-emerald-600' },
                ].map((m, i) => (
                  <div key={i} className="space-y-2.5">
                    <div className="flex justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      <span>{m.label}</span><span>{m.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ delay: 1 + i * 0.2, duration: 1.5, ease: "circOut" }}
                        className={`h-full bg-gradient-to-r ${m.color} rounded-full shadow-lg`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -right-10 glass-card p-6 shadow-2xl flex items-center gap-4 scale-110"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/40">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Market Ready</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">UP +12%</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity"
        >
          <div className="w-[2px] h-16 bg-gradient-to-b from-indigo-500 via-indigo-500/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── 🧊 FEATURE GRID (GLASS V3) ── */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-24">
        <div className="text-center space-y-6">
          <div className="badge-premium bg-indigo-50 text-indigo-600 border-indigo-100 inline-block">
            Tactical Modules
          </div>
          <h2 className="text-5xl md:text-7xl font-[900] text-slate-900 dark:text-white tracking-tighter">
            Total Placement <span className="text-indigo-600 italic">Domination.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Four hyper-focused training environments built to bridge the gap between candidate and elite professional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MODULES.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className="glass-card hover:border-indigo-500 group flex flex-col h-full bg-white/40 dark:bg-white/5"
            >
              <div className="absolute top-6 right-6">
                 <div className="badge-premium bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    {item.badge}
                 </div>
              </div>
              <div className={`w-16 h-16 rounded-[1.5rem] bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mb-10`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div className="space-y-4 flex-grow">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
              <Link 
                to={user ? (item.title.includes('Aptitude') ? '/aptitude' : item.title.includes('Interview') ? '/interview' : item.title.includes('Comm') ? '/communication' : '/gd-practice') : '/register'} 
                className="mt-10 flex items-center gap-3 text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group-hover:gap-6 transition-all"
              >
                Initiate Session <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 🚀 CTA: THE ULTIMATE FINISH ── */}
      <section className="py-32 section-padding">
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="glass-premium p-16 md:p-32 text-center relative overflow-hidden group bg-hero-liquid dark:bg-slate-950"
         >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 space-y-12">
               <h2 className="text-6xl md:text-[5.5rem] font-[900] text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                  Ready to Join the <br />
                  <span className="text-wow italic px-4">Placement Elite?</span>
               </h2>
               <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                  The gap between learning and getting placed is purely clinical. Bridge it today.
               </p>
               <div className="flex flex-col sm:flex-row gap-8 justify-center">
                  <Link to="/register" className="btn-wow scale-125 hover:scale-110 active:scale-95 transition-transform duration-500 px-10 py-5 flex items-center justify-center gap-3">
                     Create tactical Account <ArrowRight className="w-5 h-5" />
                  </Link>
               </div>
            </div>
         </motion.div>
      </section>
    </div>
  );
}
