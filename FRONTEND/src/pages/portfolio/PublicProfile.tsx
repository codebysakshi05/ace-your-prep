import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Target, Award, ShieldCheck, ArrowRight, 
  Brain, MessageSquare, Users, Video, Share2, 
  Lock, Globe, CheckCircle2, Star, TrendingUp,
  History, Trophy, Fingerprint, Activity, Zap
} from 'lucide-react';
import { databaseService } from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementCard } from '../../components/AchievementCard';
import toast from 'react-hot-toast';

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    const fetchPublicData = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        const [profData, statsData, activityData] = await Promise.all([
          databaseService.fetchPublicProfile(userId),
          databaseService.fetchUserStats(userId),
          databaseService.fetchPublicActivity(userId)
        ]);

        if (!profData) {
          setError('Profile not found.');
        } else if (!profData.is_public && !isOwner) {
          setError('RESTRICTED: This candidate has set their telemetry to private.');
        } else {
          setProfile(profData);
          setUserStats(statsData);
          setRecentActivity(activityData);
        }
      } catch (err) {
        setError('Failed to load portfolio telemetry.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicData();
  }, [userId, isOwner]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Public URL broadcasted.', { icon: '📡' });
  };

  const getModuleIcon = (type: string) => {
    if (type.includes('APTITUDE')) return Brain;
    if (type.includes('INTERVIEW')) return Video;
    if (type.includes('GD')) return Users;
    if (type.includes('COMM')) return MessageSquare;
    return Activity;
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-indigo-500 font-black uppercase tracking-[0.5em] animate-pulse">Decrypting Candidate Dossier...</div>;

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-inner">
           {error.includes('RESTRICTED') ? <Lock className="w-12 h-12 text-slate-400" /> : <ShieldCheck className="w-12 h-12 text-rose-500" />}
        </div>
        <div className="space-y-4">
           <h1 className="text-5xl font-[900] text-slate-900 uppercase tracking-tighter italic">Access <span className="text-rose-600">Denied.</span></h1>
           <p className="text-xl text-slate-500 max-w-md font-medium leading-relaxed">{error || 'Telemetry node unreachable.'}</p>
        </div>
        <Link to="/" className="btn-wow px-12 py-5">RETURN TO BASE</Link>
      </div>
    );
  }

  const xpInCurrentLevel = (profile?.xp || 0) % 1000;
  const progressPercent = (xpInCurrentLevel / 1000) * 100;

  return (
    <div className="min-h-screen selection:bg-indigo-100 pb-32">
      {/* 👑 ELITE DOSSIER HEADER (PHASE 6) */}
      <div className="pt-40 px-6 max-w-[1700px] mx-auto space-y-16">
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-premium p-16 md:p-24 relative overflow-hidden group bg-hero-liquid dark:bg-slate-950 border-white/40 dark:border-white/5 shadow-3xl"
        >
           <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-indigo-500/5 rounded-full blur-[200px] -mr-96 -mt-96" />
           <div className="absolute top-0 left-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
              <Fingerprint className="w-80 h-80 text-indigo-600" />
           </div>

           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="space-y-10 text-center lg:text-left">
                 <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <div className="badge-premium bg-slate-950 text-white flex items-center gap-3">
                       {profile.is_public ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                       <span className="text-[10px] uppercase tracking-widest text-indigo-400">
                          {profile.is_public ? 'Global Verification Protocol' : 'Restricted Telemetry'}
                       </span>
                    </div>
                    {isOwner && (
                      <button onClick={handleCopyLink} className="badge-premium bg-white dark:bg-white/5 text-slate-600 dark:text-white flex items-center gap-3 hover:scale-110 transition-transform">
                         <Share2 className="w-4 h-4" /> Distribute Portfolio
                      </button>
                    )}
                 </div>

                 <h1 className="text-7xl md:text-9xl font-[900] text-slate-900 dark:text-white leading-[0.8] tracking-tighter uppercase italic">
                    {profile.full_name?.split(' ')[0]} <br />
                    <span className="text-wow px-4">{profile.full_name?.split(' ')[1] || 'Operative'}</span>
                 </h1>

                 <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed italic">
                    "Cognitive execution confirmed. Verified placement authority through systematic skill calibration and performance dominance."
                 </p>

                 <div className="flex flex-wrap justify-center lg:justify-start gap-6 pb-2">
                    <div className="badge-premium bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-8 py-4">
                        <CheckCircle2 className="w-5 h-5 mr-3 inline-block" /> AUTHENTICATED INTEL
                    </div>
                    <div className="badge-premium bg-slate-950 text-white px-8 py-4">
                        GOAL: {profile.target_company || 'Undisclosed'}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-10">
                 <div className="relative group">
                    <div className="w-56 h-56 rounded-[4rem] bg-slate-950 flex items-center justify-center text-8xl font-[900] text-indigo-400 shadow-[0_40px_100px_rgba(99,102,241,0.2)] group-hover:-rotate-3 transition-transform italic">
                       {profile.full_name?.charAt(0)}
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center text-slate-950 dark:text-white shadow-3xl border-4 border-slate-950">
                       <p className="text-[10px] font-black uppercase leading-none opacity-40">LVL</p>
                       <p className="text-4xl font-[900] leading-none">{profile.level}</p>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                 {/* Skill Matrix */}
                 <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-12 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-3xl">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 mb-12">
                        <Activity className="w-8 h-8 text-indigo-600" /> Neural Matrix
                    </h3>
                    <div className="h-[350px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                             { s: 'Logic', v: userStats?.aptitude || 0 },
                             { s: 'Speech', v: userStats?.communication || 0 },
                             { s: 'Pulse', v: userStats?.gd || 0 },
                             { s: 'Stress', v: userStats?.interview || 0 },
                             { s: 'Social', v: 75 },
                          ]}>
                             <PolarGrid stroke="rgba(99, 102, 241, 0.1)" />
                             <PolarAngleAxis dataKey="s" tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }} />
                             <Radar name="User" dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                          </RadarChart>
                       </ResponsiveContainer>
                    </div>
                 </motion.div>

                 {/* Activity Dispatch */}
                 <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-12 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-3xl flex flex-col">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 mb-12">
                       <History className="w-8 h-8 text-indigo-600" /> Recent Dispatches
                    </h3>
                    <div className="space-y-8 flex-grow">
                       {recentActivity.length > 0 ? recentActivity.map((log, i) => {
                          const Icon = getModuleIcon(log.action_type);
                          return (
                             <div key={i} className="flex items-center gap-6 group p-5 glass bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/5 rounded-3xl">
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 text-indigo-400 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                   <Icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.action_type.replace(/_/g, ' ')}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                                </div>
                             </div>
                          );
                       }) : (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                             <Trophy className="w-16 h-16 mb-4" />
                             <p className="text-xs font-black uppercase tracking-widest">Awaiting Simulation Data</p>
                          </div>
                       )}
                    </div>
                 </motion.div>
              </div>

              {/* Achievements DNA */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-3xl">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 mb-12">
                    <Award className="w-8 h-8 text-amber-500" /> Authority DNA
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {profile.achievements && profile.achievements.length > 0 ? profile.achievements.map((ach: any, i: number) => (
                       <AchievementCard key={i} achievement={ach} />
                    )) : (
                       <div className="col-span-full py-20 bg-slate-100 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 text-center opacity-40">
                          <Lock className="w-10 h-10 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Legacy Unlocked Upon Mastery</p>
                       </div>
                    )}
                 </div>
              </motion.div>
           </div>

           <div className="lg:col-span-4 space-y-12">
              <div className="glass-card p-12 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-3xl space-y-10">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Total Cognitive XP</p>
                    <p className="text-8xl font-[900] text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{profile.xp || 0}</p>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Sector Calibration</p>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progressPercent)}%</p>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/10">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]" />
                    </div>
                 </div>
              </div>

              <div className="glass-card p-12 bg-slate-950 text-white shadow-3xl space-y-10 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-hero-liquid opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                 <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 relative z-10">
                    <Target className="w-8 h-8 text-rose-500" /> Target Directive
                 </h3>
                 <div className="glass bg-white/10 rounded-[2.5rem] p-10 border-white/10 relative z-10 group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 opacity-50">Career sector</p>
                    <p className="text-4xl font-[900] tracking-tighter uppercase italic">{profile.target_company || 'CLASSIFIED'}</p>
                    <div className="mt-8 flex items-center gap-4 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
                       <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Pre-Qualified Status</span>
                    </div>
                 </div>
              </div>

              <div className="glass-card p-12 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-3xl">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 italic">Node Verification</p>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                       <span className="text-xs font-bold text-slate-500 italic">Candidate ID</span>
                       <span className="text-[10px] font-black text-slate-800 dark:text-white">{userId?.slice(0, 10).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                       <span className="text-xs font-bold text-slate-500 italic">Data Integrity</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest shadow-lg shadow-emerald-500/20 px-3 py-1 bg-emerald-500/10 rounded-lg">CALIBRATED</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <footer className="mt-40 py-32 bg-slate-950 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-hero-liquid opacity-10" />
         <div className="relative z-10 max-w-4xl mx-auto space-y-12 px-6">
            <h4 className="text-6xl md:text-8xl font-[900] text-white italic tracking-tighter uppercase leading-none">BUILD YOUR OWN <br /><span className="text-wow px-6">LEGACY.</span></h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-8">
               <Link to="/register" className="btn-wow px-20 py-8 scale-125 flex items-center justify-center gap-6">
                  DEPLOY PROTOCOL <ArrowRight className="w-8 h-8" />
               </Link>
            </div>
         </div>
      </footer>
    </div>
  );
}
