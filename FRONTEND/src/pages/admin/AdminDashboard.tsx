import { useState, useEffect } from 'react';
import { Users, Brain, Activity, TrendingUp, ShieldCheck, Mail, Database, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalActivities: 0,
    avgMastery: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: questionCount } = await supabase.from('module_questions').select('*', { count: 'exact', head: true });
      const { count: activityCount } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });
      
      const { data: scores } = await supabase.from('aptitude_scores').select('score');
      const avg = scores && scores.length > 0 
        ? Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length) 
        : 0;

      setStats({
        totalUsers: userCount || 0,
        totalQuestions: questionCount || 0,
        totalActivities: activityCount || 0,
        avgMastery: avg
      });

      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (users) setRecentUsers(users);

      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (logs) setRecentLogs(logs);

      setIsLoading(false);
    };

    fetchAdminData();
  }, []);

  const statCards = [
    { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Event Logs', value: stats.totalActivities, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Global Mastery', value: `${stats.avgMastery}%`, icon: Brain, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'Question Bank', value: stats.totalQuestions, icon: Database, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  if (isLoading) return <div className="text-primary font-black uppercase tracking-[0.2em] text-xs flex justify-center py-32 animate-pulse">Synchronizing Admin Matrix...</div>;

  return (
    <div className="space-y-12 animate-fade-in pb-12 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-50 rounded-3xl border border-rose-200 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-rose-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Command Center</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">SaaS Infrastructure Governance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Hyper-Scale Engine Online</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 group relative overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700`}>
                <stat.icon className={`w-24 h-24 ${stat.color}`} />
            </div>
            
            <div className={`p-4 ${stat.bg} w-fit rounded-2xl mb-8 border border-slate-100 relative z-10`}>
               <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-4xl font-black text-slate-900 mb-2 tracking-tighter tabular-nums relative z-10">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] relative z-10">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Registered Users */}
        <div className="lg:col-span-12 xl:col-span-5 glass-card p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <Users className="w-32 h-32 text-primary" />
           </div>
           
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 relative z-10">
                <TrendingUp className="w-6 h-6 text-indigo-500" /> New Activations
              </h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline relative z-10 flex items-center gap-2">View Directory <ChevronRight className="w-3 h-3" /></button>
           </div>

           <div className="space-y-4 relative z-10">
              {recentUsers.map((u, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id} 
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-indigo-100 text-white font-black">
                      {u.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{u.full_name || 'Anonymous User'}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 tracking-tight">
                        <Mail className="w-3 h-3" /> {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">{u.role}</span>
                  </div>
                </motion.div>
              ))}
              {recentUsers.length === 0 && <p className="text-slate-300 text-center py-10 font-bold uppercase text-[10px] tracking-widest">No recently joined users.</p>}
           </div>
        </div>

        {/* System Logs & Health */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-10">
           <div className="glass-card p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Activity className="w-48 h-48 text-rose-500" />
              </div>

              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 relative z-10">
                   <BarChart3 className="w-6 h-6 text-rose-500" /> Neural Event Stream
                 </h3>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Real-time</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                 <div className="md:col-span-7 space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                    {recentLogs.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={log.id} 
                        className="p-5 bg-slate-50 rounded-2xl border-l-[6px] border-l-primary border border-slate-200 relative group hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            {log.action_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase">
                            <Clock className="w-3.5 h-3.5" /> {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">
                          <span className="text-rose-500 font-black mr-2 uppercase tracking-tight">[{log.profiles?.full_name?.split(' ')[0] || 'System'}]:</span>
                          {log.context}
                        </p>
                      </motion.div>
                    ))}
                 </div>

                 <div className="md:col-span-5 space-y-6">
                    <div className="glass-card p-8 bg-slate-50 border-slate-200 text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Traffic Health</p>
                       <div className="relative w-32 h-32 mx-auto mb-6">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * 0.94)} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-3xl font-black text-slate-900 tracking-tighter">94%</span>
                          </div>
                       </div>
                       <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Logic Accuracy</p>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">System Distribution</p>
                       {[
                         { label: 'Cloud Sync', val: '100%', color: 'text-indigo-600' },
                         { label: 'Neural Core', val: '98%', color: 'text-emerald-600' },
                         { label: 'DB Latency', val: '24ms', color: 'text-cyan-600' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{item.label}</span>
                            <span className={`text-[10px] font-black ${item.color} uppercase`}>{item.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
