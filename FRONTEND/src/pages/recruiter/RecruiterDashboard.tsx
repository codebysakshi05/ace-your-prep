import { useState, useEffect } from 'react';
import { 
   Users, Search, Globe, Shield, 
   Zap, Briefcase, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { databaseService } from '../../services/databaseService';
import { COMPANY_BENCHMARKS } from '../../constants/benchmarks';
import { SkeletonList } from '../../components/ui/SkeletonLoaders';
import toast from 'react-hot-toast';

export function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState(COMPANY_BENCHMARKS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await databaseService.fetchAllPublicCandidates();
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateFitScore = (candidateStats: any, benchmarkThresholds: any) => {
    if (!candidateStats) return 0;
    const scores = [
      Math.min(100, (candidateStats.aptitude / benchmarkThresholds.aptitude) * 100),
      Math.min(100, (candidateStats.communication / benchmarkThresholds.communication) * 100),
      Math.min(100, (candidateStats.gd / benchmarkThresholds.gd) * 100),
      Math.min(100, (candidateStats.interview / benchmarkThresholds.interview) * 100),
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / 4);
  };

  const filteredCandidates = candidates
    .filter(c => c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(c => ({
      ...c,
      fitScore: calculateFitScore(c.stats, selectedBenchmark.thresholds)
    }))
    .sort((a, b) => b.fitScore - a.fitScore);

  const handleCopyReferral = (id: string) => {
    const url = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Verified Referral Bridge copied to clipboard!');
  };

  if (loading) return <div className="p-12"><SkeletonList /></div>;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12 animate-fade-in">
      {/* 🚀 Recruiter Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
             <Shield className="w-3 h-3 text-indigo-600" />
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Enterprise Talent Nexus</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
            Recruiter <span className="text-indigo-600">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Discover elite candidates verified by Ace It Up training protocols.</p>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full lg:w-80 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-sm"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
             <Building2 className="w-4 h-4 text-indigo-400" />
             <select 
               value={selectedBenchmark.id}
               onChange={(e) => setSelectedBenchmark(COMPANY_BENCHMARKS.find(b => b.id === e.target.value)!)}
               className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
             >
               {COMPANY_BENCHMARKS.map(b => (
                 <option key={b.id} value={b.id} className="text-slate-900">{b.name} Benchmark</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      {/* 📊 Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCandidates.map((candidate) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={candidate.id}
              className="glass-premium p-8 group relative overflow-hidden flex flex-col justify-between h-full"
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
                candidate.fitScore >= 85 ? 'from-amber-500/5' : 'from-indigo-500/5'
              } to-transparent opacity-0 group-hover:opacity-100 -z-10`}></div>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl italic shadow-lg">
                      {candidate.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{candidate.full_name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <Zap className="w-3 h-3 text-amber-500" /> LVL {candidate.level} Candidate
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border flex flex-col items-center ${
                    candidate.fitScore >= 85 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Fit Match</span>
                    <span className="text-xl font-black">{candidate.fitScore}%</span>
                  </div>
                </div>

                {/* Skill Matrix Preview */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                   {[
                     { label: 'Aptitude', val: candidate.stats.aptitude },
                     { label: 'Interview', val: candidate.stats.interview },
                     { label: 'Comm', val: candidate.stats.communication },
                     { label: 'GD', val: candidate.stats.gd }
                   ].map(s => (
                     <div key={s.label}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <div className="flex items-center gap-2">
                           <div className="h-1 flex-grow bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-900" style={{ width: `${s.val}%` }}></div>
                           </div>
                           <span className="text-[10px] font-black text-slate-700">{s.val}%</span>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified Achievements</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.achievements?.slice(0, 3).map((a: any, i: number) => (
                      <div key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-slate-600 uppercase">
                        {a.name}
                      </div>
                    )) || <span className="text-xs text-slate-400 italic">No achievements verified yet</span>}
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-3">
                <Link 
                  to={`/p/${candidate.id}`}
                  className="flex-grow btn-secondary-glass py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Globe className="w-4 h-4" /> Comprehensive DNA
                </Link>
                <button 
                  onClick={() => handleCopyReferral(candidate.id)}
                  className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-colors group/btn"
                  title="Copy Referral Bridge"
                >
                  <Briefcase className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-32 glass-premium">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">No Matches Detected</h2>
          <p className="text-slate-500 mt-2">Adjust your benchmark or search query to discover more talent.</p>
        </div>
      )}
    </div>
  );
}
