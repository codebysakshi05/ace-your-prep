import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Crown, Star, 
  ChevronRight, Award, Search,
  Share2, Globe, ShieldCheck, Target, BarChart3, Zap, Activity, ArrowRight
} from 'lucide-react';
import { databaseService } from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await databaseService.fetchLeaderboard();
        setLeaders(data);
        const currentRank = data.findIndex((l: any) => l.id === user?.id);
        if (currentRank !== -1) setMyRank(currentRank + 1);
      } catch (err) {
        console.error('Leaderboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredLeaders = leaders.filter(l => 
    l.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankData = (index: number) => {
    if (index === 0) return { tier: 'Placement Legend', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Crown };
    if (index < 3) return { tier: 'Elite Node', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Medal };
    return { tier: 'Sector Pro', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/10', icon: Target };
  };

  const handleShareRank = () => {
    if (!myRank) return;
    const text = `I just hit Rank #${myRank} on Ace It Up! Profile: ${window.location.origin}/p/${user?.id}`;
    navigator.clipboard.writeText(text);
    toast.success('Broadcast Link Copied.', { icon: '📡' });
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-indigo-500 font-black uppercase tracking-[0.5em] animate-pulse">Scanning Global Roster...</div>;

  return (
    <div className="max-w-[1700px] mx-auto space-y-16 pb-32 pt-6 px-6 animate-fade-in">
      
      {/* 👑 SUPREMACY HEADER (PHASE 6) */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium p-16 md:p-24 relative overflow-hidden group bg-hero-liquid dark:bg-slate-950 border-white/40 dark:border-white/5"
      >
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-indigo-600/5 rounded-full blur-[200px] -mr-96 -mt-96" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-20">
          <div className="space-y-10 text-center lg:text-left">
            <div className="badge-premium bg-slate-950 text-white flex items-center gap-4">
                <Globe className="w-5 h-5 text-indigo-400" /> Global Standings Active
            </div>

            <h1 className="text-7xl md:text-9xl font-[900] text-slate-900 dark:text-white leading-[0.8] tracking-tighter uppercase italic">
                Placement <br />
                <span className="text-wow px-4">Supremacy.</span>
            </h1>

            <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                Behold the global roster of elite candidates. Rankings determined by <span className="text-indigo-600 dark:text-indigo-400 font-black italic">Verified XP</span> and social dominance metrics.
            </p>

            <div className="relative max-w-md mx-auto lg:mx-0">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Locate User Node..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/60 dark:bg-white/5 border-2 border-white/80 dark:border-white/10 rounded-full py-6 pl-16 pr-10 text-xl font-bold focus:border-indigo-500 transition-all shadow-xl dark:text-white"
               />
            </div>
          </div>

          {myRank && (
            <motion.div 
               whileHover={{ scale: 1.05 }}
               onClick={handleShareRank}
               className="glass-premium p-12 flex items-center gap-10 bg-white/60 dark:bg-white/5 border-white cursor-pointer group shadow-3xl"
            >
               <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-indigo-400 shadow-2xl relative">
                  <p className="text-6xl font-black tabular-nums">{myRank}</p>
                  <div className="absolute -top-4 -right-4 bg-indigo-600 text-white p-3 rounded-xl animate-bounce">
                    <Crown className="w-6 h-6" />
                  </div>
               </div>
               <div className="text-left space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Your Survival Rank</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
                     {myRank <= 3 ? 'LEGEND' : 'OPERATIVE'}
                     <Share2 className="w-6 h-6 text-indigo-500 group-hover:rotate-12 transition-transform" />
                  </p>
               </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 space-y-6">
           <AnimatePresence>
             {filteredLeaders.map((leader, idx) => {
               const rankData = getRankData(idx);
               const RankIcon = rankData.icon;
               return (
                 <motion.div
                   key={leader.id}
                   initial={{ opacity: 0, x: -30 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className={`glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 group transition-all hover:scale-[1.02] border-white/60 dark:border-white/10 
                     ${leader.id === user?.id ? 'ring-4 ring-indigo-500 shadow-2xl' : ''}`}
                 >
                   <div className="flex items-center gap-10 flex-grow w-full">
                      <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center flex-shrink-0 shadow-2xl transition-transform group-hover:rotate-6
                        ${idx === 0 ? 'bg-amber-500 text-white' : idx < 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                         {idx < 3 ? <RankIcon className="w-10 h-10" /> : <p className="text-3xl font-black">{idx + 1}</p>}
                      </div>

                      <div className="space-y-1">
                         <div className="flex items-center gap-4">
                            <h3 className="text-3xl md:text-4xl font-[900] text-slate-900 dark:text-white tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                              {leader.full_name || 'Anonymous Node'}
                            </h3>
                            {leader.id === user?.id && <div className="badge-premium bg-indigo-600 text-white">YOU</div>}
                         </div>
                         <p className={`text-xs font-black uppercase tracking-[0.3em] ${rankData.color}`}>{rankData.tier}</p>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center justify-end gap-16 w-full md:w-auto">
                      <div className="text-right space-y-1">
                         <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{leader.xp.toLocaleString()}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global XP</p>
                      </div>

                      <div className="text-right space-y-1">
                         <p className="text-4xl font-black text-amber-500 tracking-tighter tabular-nums flex items-center justify-end gap-2">
                           <Activity className="w-6 h-6 animate-pulse" /> {leader.streak_count}
                         </p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Day Streak</p>
                      </div>

                      <div className="flex items-center gap-4">
                         {leader.id !== user?.id && (
                           <Link to={`/p/${leader.id}`} className="w-16 h-16 glass bg-white dark:bg-white/5 dark:text-white border-white dark:border-white/10 rounded-2xl flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all shadow-xl">
                              <ArrowRight className="w-8 h-8" />
                           </Link>
                         )}
                      </div>
                   </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
        </div>
      </div>

      {/* ── ASCENSION CTA ── */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         whileInView={{ opacity: 1, scale: 1 }}
         viewport={{ once: true }}
         className="p-20 md:p-32 text-center rounded-[4rem] bg-slate-950 text-white relative overflow-hidden group shadow-3xl"
      >
          <div className="absolute inset-0 bg-hero-liquid opacity-20" />
          <Crown className="w-24 h-24 text-amber-500 mx-auto mb-10 animate-pulse relative z-10" />
          <h2 className="text-6xl md:text-8xl font-[900] uppercase tracking-tighter mb-12 leading-none italic relative z-10">Ascend to <br /><span className="text-wow px-6">Zenith.</span></h2>
          <p className="text-2xl text-slate-400 font-medium max-w-3xl mx-auto mb-16 leading-relaxed relative z-10">
            Every simulation executed and every mission finished elevates your global standing. The top 0.1% receive exclusive <span className="text-indigo-400 font-black italic">Recruiter Channels</span>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8 relative z-10">
             <Link to="/practice" className="btn-wow px-16 py-7 scale-125">
               INITIATE ASCENSION
             </Link>
          </div>
      </motion.div>
    </div>
  );
}
