import { useState, useEffect } from 'react';
import { 
  BarChart2, ArrowUpRight, Sparkles,
  Activity, Star
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { COMPANY_BENCHMARKS } from '../../constants/benchmarks';

export function SmartInsights() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    aptitude: [],
    mastery: [],
    trends: []
  });
  const [selectedBenchmark] = useState(COMPANY_BENCHMARKS[0]);

  useEffect(() => {
    if (user) fetchInsights();
  }, [user]);

  const fetchInsights = async () => {
    
    // 1. Fetch Aptitude Data
    const { data: aptitude } = await supabase
      .from('aptitude_scores')
      .select('score, topic, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    // 2. Fetch Interview Data
    const { data: interview } = await supabase
      .from('interview_scores')
      .select('evaluation_score, question_category, created_at')
      .eq('user_id', user?.id);

    // Process Mastery Data (Radar)
    const masteryData = [
      { subject: 'Quant', value: 0 },
      { subject: 'Logic', value: 0 },
      { subject: 'Verbal', value: 0 },
      { subject: 'Interview', value: 0 },
      { subject: 'Comm', value: 0 },
    ];

    if (aptitude) {
      aptitude.forEach(s => {
        if (s.topic === 'Quants') masteryData[0].value = Math.max(masteryData[0].value, s.score);
        if (s.topic === 'Logical') masteryData[1].value = Math.max(masteryData[1].value, s.score);
        if (s.topic === 'Verbal') masteryData[2].value = Math.max(masteryData[2].value, s.score);
      });
    }
    if (interview) {
      const avg = interview.reduce((a, b) => a + b.evaluation_score, 0) / (interview.length || 1);
      masteryData[3].value = Math.round(avg);
    }

    // Add Benchmark Data for comparison
    const masteryWithBenchmarks = masteryData.map(m => {
      let bValue = 70; // Default
      if (m.subject === 'Quant') bValue = selectedBenchmark.thresholds.aptitude;
      if (m.subject === 'Logic') bValue = selectedBenchmark.thresholds.aptitude;
      if (m.subject === 'Interview') bValue = selectedBenchmark.thresholds.interview;
      if (m.subject === 'Comm') bValue = selectedBenchmark.thresholds.communication;
      return { ...m, benchmark: bValue };
    });

    setStats({
      aptitude: aptitude || [],
      mastery: masteryWithBenchmarks,
      trends: (aptitude || []).map((s, i) => ({ name: `Set ${i+1}`, score: s.score }))
    });
  };



  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-12 pb-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-white flex items-center gap-4 mb-2 tracking-tight uppercase">
             <BarChart2 className="w-10 h-10 text-cyan-400" /> Skill Analytics
           </h1>
           <p className="text-indigo-300/70 text-lg">Detailed breakdown of your growth trajectory, skill mastery, and placement readiness benchmarks.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-3xl backdrop-blur-xl">
              <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-sm font-black text-white uppercase tracking-tighter">Analyzing Performance</span>
              </div>
           </div>
        </div>
      </div>

      {/* Grid: Radar and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Skill Mastery Radar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-5 glass rounded-[2.5rem] p-10 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Star className="w-32 h-32 text-primary" />
           </div>
           <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Full-Stack Mastery</h2>
           <p className="text-indigo-300/50 text-xs font-bold uppercase tracking-widest mb-12">Composite Skill Vector</p>
           
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.mastery}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Student"
                        dataKey="value"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name="Benchmark"
                        dataKey="benchmark"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                        strokeDasharray="4 4"
                      />
                  </RadarChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Strongest Link</p>
                 <p className="text-lg font-black text-white uppercase tabular-nums">Logical <ArrowUpRight className="w-4 h-4 inline text-emerald-400" /></p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Growth Area</p>
                 <p className="text-lg font-black text-white uppercase tabular-nums">Verbal <Sparkles className="w-4 h-4 inline text-amber-400" /></p>
              </div>
           </div>
        </motion.div>

        {/* Growth Trajectory Line Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 glass rounded-[2.5rem] p-10 relative"
        >
           <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Growth Trajectory</h2>
           <p className="text-indigo-300/50 text-xs font-bold uppercase tracking-widest mb-12 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Historical Learning Momentum
           </p>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trends}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                        itemStyle={{ color: '#fff', fontWeight: 900 }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="absolute bottom-10 right-10 flex gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Velocity</p>
                 <p className="text-2xl font-black text-white tabular-nums">+12.4%</p>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Bottom Row: AI Insights and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recommendation Engine */}
        <div className="lg:col-span-8 glass rounded-[2.5rem] p-10">
           <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400" /> Personalized Strategy
           </h3>
           <div className="space-y-6">
              {[
                { title: 'Quantitative Boost', action: 'Focused drills on Algebra and Geometry needed.', priority: 'High', color: 'bg-rose-500' },
                { title: 'Professional Polish', action: 'Your interview confidence is high. Focus on closing statements.', priority: 'Medium', color: 'bg-amber-500' },
                { title: 'Consistency streak', action: 'Maintain current momentum for 3 more days to unlock "Pioneer" badge.', priority: 'Low', color: 'bg-emerald-500' },
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                   <div className={`w-1.5 h-12 ${rec.color} rounded-full`}></div>
                   <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="text-lg font-black text-white tracking-tight uppercase">{rec.title}</h4>
                         <span className="text-[9px] font-black uppercase bg-white/10 px-3 py-1 rounded-full text-indigo-400 tracking-widest">{rec.priority} Priority</span>
                      </div>
                      <p className="text-sm text-indigo-300/50 font-medium">{rec.action}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Readiness Meter */}
        <div className="lg:col-span-4 glass rounded-[3rem] p-10 text-center relative overflow-hidden flex flex-col justify-center">
           <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10"></div>
           <h3 className="text-xl font-black text-white mb-10 uppercase tracking-tight">Placement readiness</h3>
           
           <div className="relative w-48 h-48 mx-auto mb-10">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
                 <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 - (552.92 * 0.72)} className="text-primary" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-black text-white tabular-nums tracking-tighter">72%</span>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Optimized</span>
              </div>
           </div>
           
           <p className="text-xs font-bold text-indigo-300/50 uppercase tracking-widest mb-10">Tier 1 Target Readiness</p>
           <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Download Audit Report</button>
        </div>
      </div>
    </div>
  );
}
