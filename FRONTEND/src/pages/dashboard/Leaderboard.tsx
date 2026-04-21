import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Crown, Zap, ChevronRight
} from 'lucide-react';
import { databaseService } from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await databaseService.fetchLeaderboard();
        setLeaders(data);
        
        // Find current user's rank
        const currentRank = data.findIndex((l: any) => l.id === user?.id);
        if (currentRank !== -1) {
          setMyRank(currentRank + 1);
        }
      } catch (err) {
        console.error('Leaderboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-8 h-8 text-amber-500 animate-bounce" />;
    if (index === 1) return <Medal className="w-7 h-7 text-slate-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-xl font-black text-slate-300">{index + 1}</span>;
  };

  const getRankBorder = (index: number) => {
    if (index === 0) return 'border-amber-200 glow-amber bg-amber-50/30';
    if (index === 1) return 'border-slate-200 bg-slate-50/30';
    if (index === 2) return 'border-amber-100 bg-amber-50/10';
    return 'border-slate-100 bg-white';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Trophy className="w-16 h-16 text-indigo-400 animate-pulse" />
        <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em]">Syncing Global Rankings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20 px-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-slate-200 pb-12">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-100 px-5 py-2 rounded-full">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Global Pro Leaderboard</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Elite <span className="text-gradient-premium">Performers</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl">
            The top 10 placement candidates globally based on skill consistency, XP, and streaks.
          </p>
        </div>

        {myRank && (
          <div className="glass-premium p-8 flex items-center gap-6 shadow-xl shadow-indigo-500/10 border-indigo-200">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                <p className="text-[10px] font-black uppercase tracking-widest absolute -top-4 text-indigo-600">Your Rank</p>
                <p className="text-3xl font-black">{myRank}</p>
             </div>
             <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Candidate Status</p>
                <p className="text-xl font-bold text-slate-900 uppercase tracking-tighter">{myRank <= 3 ? 'Elite Legend' : 'Placement Pro'}</p>
             </div>
          </div>
        )}
      </div>

      {/* ── Table Legend ── */}
      <div className="grid grid-cols-12 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Candidate Node</div>
        <div className="col-span-2 text-center">Level</div>
        <div className="col-span-2 text-center">XP Points</div>
        <div className="col-span-2 text-right">Streak</div>
      </div>

      {/* ── Leaders List ── */}
      <div className="space-y-4">
        <AnimatePresence>
          {leaders.map((leader, idx) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`grid grid-cols-12 items-center p-8 rounded-[2rem] border-2 transition-all hover:scale-[1.02] cursor-default ${getRankBorder(idx)} ${leader.id === user?.id ? 'border-primary ring-4 ring-primary/5' : ''}`}
            >
              <div className="col-span-1 flex justify-center">
                {getRankIcon(idx)}
              </div>
              
              <div className="col-span-5 flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                   {leader.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                   <p className="text-xl font-black text-slate-900 tracking-tighter">
                     {leader.full_name || 'Anonymous Node'}
                     {leader.id === user?.id && <span className="ml-3 text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                   </p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Placement-Ready</p>
                </div>
              </div>

              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-xs shadow-md">
                   <Zap className="w-3.5 h-3.5 text-indigo-400" /> {leader.level}
                </div>
              </div>

              <div className="col-span-2 text-center">
                 <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{leader.xp.toLocaleString()}</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global XP</p>
              </div>

              <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-3">
                   <div className="text-right">
                      <p className="text-xl font-black text-slate-900 tracking-tighter">{leader.streak_count} Days</p>
                      <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                         <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (leader.streak_count / 30) * 100)}%` }} />
                      </div>
                   </div>
                   <div className="p-3 bg-amber-50 rounded-xl animate-streak-fire">
                      <Zap className="w-5 h-5 text-amber-600 fill-current" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Call to Action ── */}
      <div className="mt-20 glass-premium p-12 text-center relative overflow-hidden bg-white">
          <div className="absolute inset-0 shimmer opacity-10 pointer-events-none"></div>
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Ascend to the Throne</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            Every practice session, interview simulation, and mock test earns you XP. Consistent daily use builds your streak and catapults you to the top of the global placement roster.
          </p>
          <div className="flex justify-center gap-4">
             <Link to="/practice" className="btn-premium px-12 py-5 shadow-indigo-500/30">
               Practice Now <ChevronRight className="w-5 h-5" />
             </Link>
          </div>
      </div>
    </div>
  );
}
