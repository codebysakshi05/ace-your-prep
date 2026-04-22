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
import { supabase } from '../../lib/supabase';

export function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData(showLoader = true) {
      if (showLoader) setLoading(true);
      try {
        const data = await databaseService.fetchLeaderboard();
        setLeaders(data);
        const currentRank = data.findIndex((l: any) => l.id === user?.id);
        if (currentRank !== -1) setMyRank(currentRank + 1);
      } catch (err) {
        console.error('Leaderboard load error:', err);
      } finally {
        if (showLoader) setLoading(false);
      }
    }
    
    loadData(true);

    // 🚀 INITIALIZE REALTIME WEB-SOCKET SUBSCRIPTION
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          console.log("🌐 Realtime Pulse detected on profiles table. Silent refresh initiated.");
          loadData(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredLeaders = leaders.filter(l => 
    l.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankData = (index: number) => {
    if (index === 0) return { tier: 'Top Student', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Crown };
    if (index < 3) return { tier: 'Expert', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Medal };
    return { tier: 'Active Student', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/10', icon: Target };
  };

  const handleShareRank = () => {
    if (!myRank) return;
    const text = `I just hit Rank #${myRank} on Ace It Up! Profile: ${window.location.origin}/p/${user?.id}`;
    navigator.clipboard.writeText(text);
    toast.success('Profile Link Copied.', { icon: '📋' });
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-primary font-black uppercase tracking-[0.5em] animate-pulse">Loading Global Rankings...</div>;

  return (
    <div className="max-w-[1700px] mx-auto space-y-16 pb-32 pt-6 px-6 animate-fade-in">
      
      {/* 👑 SUPREMACY HEADER (PHASE 6) */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium p-16 md:p-24 relative overflow-hidden group bg-hero-liquid dark:bg-slate-950 border-white/40 dark:border-white/5"
      >
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[200px] -mr-96 -mt-96" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-20">
          <div className="space-y-10 text-center lg:text-left">
            <div className="badge-premium bg-headingText text-white flex items-center gap-4">
                <Globe className="w-5 h-5 text-primary" /> Global Standings Active
            </div>

            <h1 className="text-5xl md:text-7xl font-[900] text-headingText leading-[0.8] tracking-tighter uppercase italic">
                Global <br />
                <span className="text-wow px-4">Excellence.</span>
            </h1>

            <p className="text-2xl text-mainText max-w-2xl font-medium leading-relaxed">
                Check out the top-performing students on the platform. Rankings are based on your total <span className="text-primary font-black italic">Practice XP</span> and consistency.
            </p>

            <div className="relative max-w-md mx-auto lg:mx-0">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-mutedText" />
               <input 
                 type="text" 
                 placeholder="Search for a student..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-surface/60 dark:bg-white/5 border-2 border-border rounded-full py-6 pl-16 pr-10 text-xl font-bold focus:border-primary transition-all shadow-xl text-headingText"
               />
            </div>
          </div>

          {myRank && (
            <motion.div 
               whileHover={{ scale: 1.05 }}
               onClick={handleShareRank}
               className="glass-premium p-12 flex items-center gap-10 bg-surface/60 dark:bg-white/5 border-border cursor-pointer group shadow-3xl"
            >
               <div className="w-24 h-24 bg-headingText rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl relative">
                  <p className="text-6xl font-black tabular-nums">{myRank}</p>
                  <div className="absolute -top-4 -right-4 bg-primary text-white p-3 rounded-xl animate-bounce">
                    <Crown className="w-6 h-6" />
                  </div>
               </div>
               <div className="text-left space-y-2">
                  <p className="text-[10px] font-black text-mutedText uppercase tracking-[0.3em]">Your Current Rank</p>
                  <p className="text-4xl font-black text-headingText uppercase tracking-tighter italic flex items-center gap-4">
                     {myRank <= 3 ? 'LEGEND' : 'TOP TIER'}
                     <Share2 className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
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
                   className={`glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 group transition-all hover:scale-[1.02] border-border 
                     ${leader.id === user?.id ? 'ring-4 ring-primary shadow-2xl' : ''}`}
                 >
                   <div className="flex items-center gap-10 flex-grow w-full">
                      <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center flex-shrink-0 shadow-2xl transition-transform group-hover:rotate-6
                        ${idx === 0 ? 'bg-amber-500 text-white' : idx < 3 ? 'bg-primary text-white' : 'bg-surface/50 text-mutedText'}`}>
                         {idx < 3 ? <RankIcon className="w-10 h-10" /> : <p className="text-3xl font-black">{idx + 1}</p>}
                      </div>

                      <div className="space-y-1">
                         <div className="flex items-center gap-4">
                            <h3 className="text-3xl md:text-4xl font-[900] text-headingText tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                              {leader.full_name || 'Anonymous Student'}
                            </h3>
                            {leader.id === user?.id && <div className="badge-premium bg-primary text-white">YOU</div>}
                         </div>
                         <p className={`text-xs font-black uppercase tracking-[0.3em] ${rankData.color}`}>{rankData.tier}</p>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center justify-end gap-16 w-full md:w-auto">
                      <div className="text-right space-y-1">
                         <p className="text-4xl font-black text-headingText tracking-tighter tabular-nums">{leader.xp.toLocaleString()}</p>
                         <p className="text-[10px] font-black text-mutedText uppercase tracking-widest">Global XP</p>
                      </div>

                      <div className="text-right space-y-1">
                         <p className="text-4xl font-black text-amber-500 tracking-tighter tabular-nums flex items-center justify-end gap-2">
                           <Activity className="w-6 h-6 animate-pulse" /> {leader.streak_count}
                         </p>
                         <p className="text-[10px] font-black text-mutedText uppercase tracking-widest text-right">Day Streak</p>
                      </div>

                      <div className="flex items-center gap-4">
                         {leader.id !== user?.id && (
                           <Link to={`/p/${leader.id}`} className="w-16 h-16 glass bg-surface text-headingText border-border rounded-2xl flex items-center justify-center hover:bg-headingText hover:text-white transition-all shadow-xl">
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

      {/* ── CTA ── */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         whileInView={{ opacity: 1, scale: 1 }}
         viewport={{ once: true }}
         className="p-20 md:p-32 text-center rounded-[4rem] bg-headingText text-white relative overflow-hidden group shadow-3xl"
      >
          <div className="absolute inset-0 bg-hero-liquid opacity-20" />
          <Crown className="w-24 h-24 text-amber-500 mx-auto mb-10 animate-pulse relative z-10" />
          <h2 className="text-6xl md:text-8xl font-[900] uppercase tracking-tighter mb-12 leading-none italic relative z-10">Start Your <br /><span className="text-wow px-6">Progress.</span></h2>
          <p className="text-2xl text-mutedText font-medium max-w-3xl mx-auto mb-16 leading-relaxed relative z-10">
            Every practice session and mock test you complete helps you climb the leaderboard and get closer to your dream placement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8 relative z-10">
             <Link to="/practice" className="btn-wow px-16 py-7 scale-125">
               START PRACTICING
             </Link>
          </div>
      </motion.div>
    </div>
  );
}
