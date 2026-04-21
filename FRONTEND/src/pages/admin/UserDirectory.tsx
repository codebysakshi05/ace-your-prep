import { useState, useEffect } from 'react';
import { 
  Users, Mail, Clock, Search, Activity, Info, UserPen, ChevronRight, 
  Filter, TrendingUp, X, Shield, ShieldAlert, Award
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function UserDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const fetchUserLogs = async (userId: string) => {
    setIsLogsLoading(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);
    if (data) setUserLogs(data);
    setIsLogsLoading(false);
  };

  const toggleAdmin = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    
    if (!error) {
      toast.success(`${user.full_name}'s clearance level modified to ${newRole}`, {
        icon: newRole === 'admin' ? '👑' : '👤',
        style: { background: '#0f172a', color: '#fff', border: '1px solid #4f46e5' }
      });
      fetchUsers();
      if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (filter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  return (
    <div className="space-y-12 animate-fade-in pb-12 px-4 relative">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-50 rounded-3xl border border-rose-200 shadow-sm">
            <Users className="w-10 h-10 text-rose-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Citizen Ledger</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Personnel Management & Access Authorization</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            All Clusters
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'admin' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-rose-400 hover:bg-slate-200'}`}
          >
            Admins Only
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden shadow-sm relative">
        <div className="p-10 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="relative max-w-2xl w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
            <input
              type="text"
              placeholder="Search global unit IDs, names or email contexts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-[2rem] py-5 pl-16 pr-8 text-slate-900 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Units</p>
              <p className="text-xl font-black text-slate-900 tabular-nums leading-none">{filteredUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
              <Filter className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs italic">Synchronizing Human Matrix...</div>
            ) : filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="p-10 flex flex-col xl:flex-row items-center justify-between hover:bg-slate-50 transition-all group gap-10"
              >
                <div className="flex items-center gap-8 w-full xl:w-auto">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white flex items-center justify-center font-black text-3xl text-white shadow-lg group-hover:scale-105 transition-transform">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{user.full_name || 'Unit ' + user.id.substring(0, 4)}</p>
                      {user.role === 'admin' ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[9px] font-black uppercase tracking-widest">Grand Admiral</span>
                      ) : (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[9px] font-black uppercase tracking-widest">Active Citizen</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-2.5">
                        <Mail className="w-4 h-4" /> {user.email}
                      </p>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" /> LVL {user.level || 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between xl:justify-end gap-16 w-full xl:w-auto">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Arrival Protocol</p>
                    <div className="flex items-center gap-3 justify-end">
                      <Clock className="w-4 h-4 text-slate-300" />
                      <p className="text-sm font-black text-slate-900 tabular-nums">{new Date(user.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Growth Metric</p>
                    <div className="flex items-center gap-3 justify-end">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-black text-emerald-600 tabular-nums">{user.xp || 0} XP</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => toggleAdmin(user)}
                      className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 transition-all shadow-sm active:scale-95 ${user.role === 'admin' ? 'text-rose-500 hover:bg-rose-500 hover:text-white' : 'text-indigo-500 hover:bg-primary hover:text-white'}`}
                    >
                      {user.role === 'admin' ? <ShieldAlert className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                    </button>
                    <button 
                      onClick={() => { setSelectedUser(user); fetchUserLogs(user.id); }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && filteredUsers.length === 0 && (
            <div className="p-40 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 blur-[100px]"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="p-6 bg-slate-50 rounded-full mb-8 border border-slate-200">
                  <Info className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Zero units found in search radius</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Audit Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[60] flex justify-end">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedUser(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-xl bg-white border-l border-slate-200 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.1)] overflow-y-auto"
             >
                <div className="p-10 md:p-12 space-y-12 pb-24">
                   <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Unit Audit</h2>
                      <button onClick={() => setSelectedUser(null)} className="p-3 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                      </button>
                   </div>

                   <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <Shield className="w-32 h-32 text-slate-900" />
                      </div>
                      <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center font-black text-4xl text-white shadow-lg relative z-10">
                        {selectedUser.full_name?.charAt(0)}
                      </div>
                      <div className="relative z-10">
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{selectedUser.full_name}</h3>
                         <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedUser.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                            {selectedUser.role} Protocol
                         </span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Award className="w-3 h-3" /> Growth State</p>
                         <p className="text-3xl font-black text-slate-900 tabular-nums">LVL {selectedUser.level || 1}</p>
                         <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">{selectedUser.xp || 0} Experience Points</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Registration</p>
                         <p className="text-lg font-black text-slate-900">{new Date(selectedUser.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Standard Auth Protocol</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <Activity className="w-5 h-5 text-rose-500" />
                         <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Neural Event Stream</h4>
                      </div>
                      
                      <div className="space-y-4">
                         {isLogsLoading ? (
                           <div className="p-10 text-center text-indigo-500 uppercase font-black text-[10px] tracking-widest animate-pulse">Accessing event logs...</div>
                         ) : userLogs.length > 0 ? userLogs.map((log, i) => (
                           <div key={i} className="p-5 bg-slate-50 rounded-2xl border-l-4 border-l-primary border border-slate-200">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.action_type.replace(/_/g, ' ')}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-700">{log.context}</p>
                           </div>
                         )) : (
                           <div className="p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                              <Info className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent neural events detected</p>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-200 space-y-4">
                      <button onClick={() => toggleAdmin(selectedUser)} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-3">
                         <UserPen className="w-4 h-4" /> Modify Administrative Status
                      </button>
                      <button className="w-full py-5 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                         Restrict Clearance (Suspend)
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
