import { useState, useEffect, useRef } from 'react';
import { 
  Brain, Users, MessageSquare, Video, Trophy, Zap,
  Target, Award, Clock, Activity, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, BarChart, Bar
} from 'recharts';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import toast from 'react-hot-toast';

function AnimatedCounter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    const targetValue = isNaN(value) || value === null || value === undefined ? 0 : value;
    const animation = animate(count, targetValue, { duration: 2, ease: "circOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function CircularProgress({ value, color }: { value: number, color: string }) {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100 dark:text-white/5"
        />
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray="251.2"
          initial={{ strokeDashoffset: 251.2 }}
          animate={{ strokeDashoffset: 251.2 - (251.2 * value) / 100 }}
          transition={{ duration: 2, ease: "circOut" }}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
         <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
            <AnimatedCounter value={value} suffix="%" />
         </span>
      </div>
    </div>
  );
}

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { databaseService } from '../../services/databaseService';
import { AiMentor } from '../../components/AiMentor';
import { SkeletonMetrics, SkeletonChart, SkeletonList } from '../../components/ui/SkeletonLoaders';
import { COMPANY_BENCHMARKS } from '../../constants/benchmarks';
import { LevelUpOverlay } from '../../components/ui/LevelUpOverlay';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState(COMPANY_BENCHMARKS[0]);
  
  const [stats, setStats] = useState([
    { title: 'Aptitude', value: 0, icon: Brain, color: 'text-indigo-500', ringColor: 'text-indigo-500' },
    { title: 'GD Skills', value: 0, icon: Users, color: 'text-emerald-500', ringColor: 'text-emerald-500' },
    { title: 'Comm Skills', value: 0, icon: MessageSquare, color: 'text-amber-500', ringColor: 'text-amber-500' },
    { title: 'Interviews', value: 0, icon: Video, color: 'text-rose-500', ringColor: 'text-rose-500' },
  ]);

  const [weakestTopic, setWeakestTopic] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [topicAnalysis, setTopicAnalysis] = useState<any[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevel = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userStats] = await Promise.all([
          databaseService.fetchUserStats(user.id),
          databaseService.fetchWeeklyXP(user.id)
        ]);

        if (profile?.target_company) {
          const goalBenchmark = COMPANY_BENCHMARKS.find(b => b.id === profile.target_company);
          if (goalBenchmark) setSelectedBenchmark(goalBenchmark);
        }

        const currentStats = [
          { title: 'Aptitude', value: userStats.aptitude, icon: Brain, color: 'text-indigo-500', ringColor: 'text-indigo-500' },
          { title: 'GD Skills', value: userStats.gd, icon: Users, color: 'text-emerald-500', ringColor: 'text-emerald-500' },
          { title: 'Comm Skills', value: userStats.communication, icon: MessageSquare, color: 'text-amber-500', ringColor: 'text-amber-500' },
          { title: 'Interviews', value: userStats.interview, icon: Video, color: 'text-rose-500', ringColor: 'text-rose-500' },
        ];
        
        setStats(currentStats);

        const sorted = [...currentStats].sort((a, b) => a.value - b.value);
        setWeakestTopic(sorted[0].value > 0 ? sorted[0].title : "Assessment pending");

        const { data: logs } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        await databaseService.fetchUserAchievements(user.id);

        try {
          const topics = await databaseService.fetchDetailedTopicAnalysis(user.id, 'aptitude');
          setTopicAnalysis(topics);
        } catch (err) {
          console.warn('Detailed topic analysis failed');
        }

        if (logs && logs.length > 0) {
          setRecentActivities(logs.map((log: any) => ({
            module: log.action_type.replace(/_/g, ' '),
            date: new Date(log.created_at).toLocaleDateString(),
            score: log.context.match(/\d+/)?.join('') || '-',
            icon: log.action_type.includes('APTITUDE') ? Brain : 
                  log.action_type.includes('INTERVIEW') ? Video :
                  log.action_type.includes('GD') ? Users : MessageSquare,
            bg: 'bg-white/5 dark:bg-white/5',
            color: log.action_type.includes('APTITUDE') ? 'text-indigo-400' : 
                   log.action_type.includes('INTERVIEW') ? 'text-rose-400' :
                   log.action_type.includes('GD') ? 'text-emerald-400' : 'text-amber-400'
          })));
        }
      } catch (error: any) {
        console.warn("Dashboard data fetch failed:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (profile?.level) {
      if (prevLevel.current !== null && profile.level > prevLevel.current) {
        setShowLevelUp(true);
      }
      prevLevel.current = profile.level;
    }

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('ace-score-updated', handleRefresh);
    return () => window.removeEventListener('ace-score-updated', handleRefresh);
  }, [user, profile, refreshTrigger]);

  const radarData = [
    { subject: 'Aptitude', A: stats.find(s => s.title === 'Aptitude')?.value || 0, B: selectedBenchmark.thresholds.aptitude, fullMark: 100 },
    { subject: 'GD', A: stats.find(s => s.title === 'GD Skills')?.value || 0, B: selectedBenchmark.thresholds.gd, fullMark: 100 },
    { subject: 'Comm', A: stats.find(s => s.title === 'Comm Skills')?.value || 0, B: selectedBenchmark.thresholds.communication, fullMark: 100 },
    { subject: 'Interview', A: stats.find(s => s.title === 'Interviews')?.value || 0, B: selectedBenchmark.thresholds.interview, fullMark: 100 },
  ];

  const placementProbability = (() => {
    const rawAverage = radarData.reduce((acc, curr) => {
      const b = Math.max(1, curr.B || 1);
      return acc + Math.min(100, ((curr.A || 0) / b) * 100);
    }, 0) / (radarData.length || 1);
    const result = Math.round(rawAverage + (profile?.streak_count || 0) * 0.5);
    return isNaN(result) ? 0 : Math.min(99, result);
  })();

  const jobMatches = COMPANY_BENCHMARKS.map(company => {
    const scores = [
      Math.min(100, (stats.find(s => s.title === 'Aptitude')?.value || 0) / company.thresholds.aptitude * 100),
      Math.min(100, (stats.find(s => s.title === 'GD Skills')?.value || 0) / company.thresholds.gd * 100),
      Math.min(100, (stats.find(s => s.title === 'Comm Skills')?.value || 0) / company.thresholds.communication * 100),
      Math.min(100, (stats.find(s => s.title === 'Interviews')?.value || 0) / company.thresholds.interview * 100),
    ];
    const fit = Math.round(scores.reduce((a, b) => a + b, 0) / 4);
    return { ...company, fit };
  }).sort((a, b) => b.fit - a.fit).slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-12 pb-12 pt-6 px-6 max-w-[1700px] mx-auto animate-fade-in">
        <SkeletonMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8"><SkeletonChart /></div>
          <div className="lg:col-span-4"><SkeletonList /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20 pt-6 px-6 max-w-[1700px] mx-auto">
      <LevelUpOverlay level={profile?.level || 1} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
      
      {/* 🚀 ELITE TACTICAL BANNER (PHASE 4) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium p-12 md:p-20 relative overflow-hidden group bg-hero-liquid dark:bg-slate-950 border-white/40 dark:border-white/5"
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[140px] -ml-96 -mb-96" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="space-y-10 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
               <div className="badge-premium bg-white/60 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> Platform Connected
               </div>
               <div className="badge-premium bg-slate-950 text-white flex items-center gap-3">
                  <Target className="w-4 h-4 text-rose-500" />
                  <select 
                    value={selectedBenchmark.id}
                    onChange={(e) => databaseService.updateTargetCompany(user!.id, e.target.value)}
                    className="bg-transparent outline-none cursor-pointer"
                  >
                    {COMPANY_BENCHMARKS.map(b => (
                      <option key={b.id} value={b.id} className="bg-slate-900">{b.name} GOAL</option>
                    ))}
                  </select>
               </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-[900] text-slate-900 dark:text-white leading-[0.9] tracking-[ -0.05em]">
              Dominance Status:<br />
              <span className="text-wow italic px-2">{profile?.full_name?.split(' ')[0] || "Recruit"}</span>
            </h1>

            <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
              Forensic analysis complete. Your <span className="text-indigo-600 dark:text-indigo-400 italic">Market Probability</span> is currently optimized at <span className="font-black text-slate-900 dark:text-white">{placementProbability}%</span>.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
              <Link to="/aptitude" className="btn-wow scale-110 shadow-indigo-500/20 px-10 py-5 flex items-center gap-4">
                <Zap className="w-5 h-5" /> Start Training Dispatches
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-4 px-10 py-5 glass dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all dark:text-white">
                <Trophy className="w-5 h-5 text-amber-500" /> Global Standings
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full lg:w-auto">
             <motion.div whileHover={{ scale: 1.05 }} className="glass-premium p-10 flex flex-col items-center justify-center min-w-[260px] bg-white/40 dark:bg-white/5 border-white/60">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mb-6 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">LVL <AnimatedCounter value={profile?.level || 1} /></p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Tactical Rank</p>
             </motion.div>

             <motion.div whileHover={{ scale: 1.05 }} className="glass-premium p-10 flex flex-col items-center justify-center min-w-[260px] bg-white/40 dark:bg-white/5 border-white/60">
                <div className="w-20 h-20 bg-rose-600 rounded-[2rem] mb-6 flex items-center justify-center shadow-2xl shadow-rose-500/40 animate-pulse">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter"><AnimatedCounter value={profile?.streak_count || 0} /> DAYS</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Active Streak</p>
             </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 📊 TACTICAL CLUSTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
            className="glass-card bg-white/40 dark:bg-white/5 p-10 flex items-center gap-8 group"
          >
            <CircularProgress value={stat.value} color={stat.ringColor} />
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value >= 80 ? 'EXPERT' : stat.value >= 50 ? 'STABLE' : 'CRITICAL'}</h3>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 gap-12 flex flex-col">
           {/* FORENSIC RADAR CHART */}
           <div className="glass-card p-12 bg-white/40 dark:bg-white/5">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                  <Activity className="w-8 h-8 text-indigo-600" /> Market Intelligence Radar
                </h3>
                <div className="badge-premium dark:bg-white/5 text-indigo-500">Benchmark: {selectedBenchmark.name}</div>
              </div>
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(99, 102, 241, 0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 900 }} />
                    <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    <Radar dataKey="B" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.05} strokeDasharray="5 5" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* JOB FIT TILES */}
           <div className="glass-card p-12 bg-white/40 dark:bg-white/5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-4">
                <Target className="w-8 h-8 text-rose-500" /> Opportunity Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {jobMatches.map((job) => (
                  <motion.div key={job.id} whileHover={{ y: -8 }} className="glass-card p-8 bg-white/60 dark:bg-white/10 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <img src={job.logo} alt={job.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{job.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{job.industry}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compatibility</p>
                          <p className="text-3xl font-[900] text-indigo-600 dark:text-indigo-400">{job.fit}%</p>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${job.fit}%` }} className="h-full bg-indigo-600 rounded-full" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
           <AiMentor stats={stats} />
           
           <div className="glass-card p-12 bg-white/40 dark:bg-white/5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                <Clock className="w-8 h-8 text-indigo-600" /> Activity Dispatches
              </h3>
              <div className="space-y-8">
                {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 glass dark:bg-white/5 border-white/40 dark:border-white/5 rounded-[1.5rem] hover:bg-white transition-all group">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-lg`}>
                        <act.icon className="w-6 h-6" />
                     </div>
                     <div className="flex-grow">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{act.date}</p>
                        <p className="text-base font-black text-slate-800 dark:text-white uppercase leading-tight">{act.module}</p>
                     </div>
                     <div className="text-xl font-[900] text-indigo-600 dark:text-indigo-400">{act.score}%</div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl opacity-60">
                    <Zap className="w-8 h-8 text-slate-400 mb-3" />
                    <p className="text-sm font-black text-slate-500 tracking-widest uppercase">No Active Dispatches</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Initiate a practice session to see activity logs.</p>
                  </div>
                )}
              </div>
              <Link to="/practice" className="btn-wow w-full mt-12 py-5 justify-center flex items-center gap-4 scale-95 hover:scale-100">
                Execute Practice Batch <ArrowRight className="w-5 h-5" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}