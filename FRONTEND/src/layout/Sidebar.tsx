import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Brain, 
  Video, 
  Map as MapIcon,
  ShieldCheck,
  Trophy,
  Moon,
  Sun,
  TrendingUp,
  Award,
  LogOut,
  Zap,
  Target,
  Timer,
  Sparkles
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { databaseService } from '../services/databaseService';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { theme, setTheme } = useTheme();

  // Focus Protocol State
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 mins
  // Apex Mode State (Hides non-essential career trajectory links)
  const [apexMode, setApexMode] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      databaseService.fetchUserStats(user.id)
        .then(setStats)
        .catch(err => {
          console.warn("Sidebar HUD sync failure:", err);
          setStats({ aptitude: 0, communication: 0, gd: 0, interview: 0 });
        });
    }
  }, [user]);

  useEffect(() => {
    let timer: any;
    if (focusMode && focusTime > 0) {
      timer = setInterval(() => setFocusTime(prev => prev - 1), 1000);
    } else if (focusTime === 0) {
      setFocusMode(false);
      setFocusTime(25 * 60);
    }
    return () => clearInterval(timer);
  }, [focusMode, focusTime]);

  const evolutionItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice Hub', path: '/practice', icon: Sparkles, highlight: true },
    { name: 'Mission Room', path: '/mission-room', icon: Zap },
  ];

  const trajectoryItems = [
    { name: 'Roadmap', path: '/roadmap', icon: MapIcon },
    { name: 'Insights', path: '/insights', icon: TrendingUp },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Resume Pro', path: '/resume-builder', icon: Award },
  ];

  const companies = ['Google', 'Amazon', 'McKinsey', 'TCS', 'Meta'];
  const [targetCompany, setTargetCompany] = useState('Google');

  const isAdmin = profile?.role === 'admin';

  // Calculate XP percentage
  const xpInCurrentLevel = (profile?.xp || 0) % 100;
  const levelProgress = xpInCurrentLevel;

  return (
    <aside className="w-72 bg-white/50 backdrop-blur-[24px] shadow-[inset_-1px_0_0_rgba(255,255,255,0.7),10px_0_30px_rgba(0,0,0,0.03)] border-r border-white/40 flex flex-col h-full relative z-20 overflow-hidden transition-all duration-700">
      {/* 💎 Zenith Brand & HUD */}
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent tracking-tighter">
            ACE IT UP
          </h1>
          <button 
            onClick={() => setApexMode(!apexMode)}
            className={`p-2 rounded-lg border transition-all ${apexMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-100 border-slate-200 text-indigo-600'}`}
            title="Toggle Focus Mode"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>

        {/* Learning Command HUD */}
        <div className="relative group">
          <div className="absolute inset-x-0 -top-4 -bottom-4 bg-primary/5 blur-[60px] -z-10 group-hover:bg-primary/10 transition-all duration-700"></div>
          <div className={`p-6 space-y-6 relative overflow-hidden backdrop-blur-3xl border transition-all duration-700 rounded-[2.5rem] ${focusMode ? 'bg-indigo-50 border-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : 'bg-white border-slate-100 group-hover:border-indigo-500/20 shadow-sm'}`}>
             
             {/* 🛰️ Orbital Profile Area */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-2xl transform group-hover:rotate-6 transition-transform">
                      {profile?.full_name?.charAt(0) || 'U'}
                   </div>
                   <div>
                      <p className={`text-sm font-black tracking-tight uppercase leading-none mb-1.5 ${focusMode ? 'text-white' : 'text-slate-900'}`}>{profile?.full_name?.split(' ')[0] || 'Member'}</p>
                      <select 
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        className={`bg-transparent text-[8px] font-black uppercase tracking-[0.2em] border-none p-0 focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors ${focusMode ? 'text-white/60' : 'text-slate-400'}`}
                      >
                        {companies.map(c => <option key={c} value={c} className="bg-white text-slate-900 border-none">{c} Goal</option>)}
                      </select>
                   </div>
                </div>
                <div className="flex flex-col gap-1.5">
                   <button 
                     onClick={() => setFocusMode(!focusMode)}
                     className={`p-2 rounded-xl border transition-all ${focusMode ? 'bg-white/20 border-white/20 text-white animate-pulse' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'}`}
                   >
                     <Timer className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => setTheme(theme === 'obsidian' ? 'cyber-neon' : theme === 'cyber-neon' ? 'phantom-white' : 'obsidian')}
                     className={`p-2 rounded-xl transition-all border ${focusMode ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'}`}
                   >
                     {theme === 'phantom-white' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                   </button>
                </div>
             </div>

             {/* 📡 Pulse Radar Area */}
             <AnimatePresence mode="wait">
                {focusMode ? (
                   <motion.div 
                     key="timer"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center justify-center py-6"
                   >
                      <p className="text-4xl font-black text-white tabular-nums tracking-tighter">
                         {Math.floor(focusTime / 60)}:{String(focusTime % 60).padStart(2, '0')}
                      </p>
                      <p className="text-[8px] text-white/50 font-black uppercase tracking-[0.4em] mt-3 animate-pulse">Deep Link Active</p>
                   </motion.div>
                ) : (
                   <motion.div 
                     key="radar"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="h-28 w-full flex items-center justify-center -mx-4 group-hover:scale-110 transition-transform duration-700"
                   >
                      {stats ? (
                        <ResponsiveContainer width="100%" height={110}>
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { s: 'A', v: stats.aptitude || 0 },
                            { s: 'G', v: stats.gd || 0 },
                            { s: 'C', v: stats.communication || 0 },
                            { s: 'I', v: stats.interview || 0 },
                          ]}>
                            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                            <Radar name="Target" dataKey="v" stroke="#f1f5f9" fill="#f1f5f9" fillOpacity={0.1} />
                            <Radar name="User" dataKey="v" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                         <div className="text-center opacity-10 py-8">
                            <Target className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-[8px] font-black uppercase tracking-widest">Hydrating HUD...</p>
                         </div>
                      )}
                   </motion.div>
                )}
             </AnimatePresence>
             
             {/* ⚡ Level Progress Pulse */}
             <div className={`space-y-3 pt-4 border-t ${focusMode ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none ${focusMode ? 'text-white/40' : 'text-slate-400'}`}>Candidate Grade</p>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${focusMode ? 'text-white' : 'text-slate-900'}`}>{profile?.level || 'Standard'} Tier</p>
                   </div>
                   <span className={`text-[10px] font-black ${focusMode ? 'text-white' : 'text-indigo-600'}`}>{profile?.xp || 0} XP</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden p-0.5 ${focusMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                   />
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-grow px-6 space-y-8 overflow-y-auto custom-scrollbar pb-12">
        {/* PRACTICE SECTOR */}
        <div className="space-y-2">
          <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Practice Hub</p>
          <div className="space-y-1">
            {evolutionItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/20 shadow-inner' 
                      : item.highlight
                        ? 'bg-slate-50/50 text-indigo-600 animate-pulse-slow font-medium hover:bg-indigo-50/50'
                        : 'text-slate-500 hover:bg-slate-50/50 hover:text-indigo-600 font-medium'
                    }
                  `}
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600'} transition-colors`} />
                  </motion.div>
                  <div className="flex flex-col z-10">
                    <span className="text-sm tracking-tight">{item.name}</span>
                    {item.highlight && !isActive && <span className="text-[7px] font-black uppercase tracking-widest mt-0.5 opacity-40">Rapid Session</span>}
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavZenith" 
                      className="absolute left-0 w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full shadow-sm shadow-indigo-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CAREER PATH (Hidden in Apex Mode) */}
        {!apexMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Career Path</p>
            <div className="space-y-1">
              {trajectoryItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 group relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-cyan-50 to-cyan-100/50 text-cyan-700 font-semibold shadow-sm shadow-cyan-100/20 shadow-inner' 
                        : 'text-slate-500 hover:bg-slate-50/50 hover:text-cyan-600 font-medium'
                      }
                    `}
                  >
                    <motion.div whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : 'group-hover:text-cyan-600'} transition-colors`} />
                    </motion.div>
                    <span className="text-sm tracking-tight z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="px-3 pt-6 space-y-4">
           <p className="px-3 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-50">Quick Training</p>
           <div className="grid grid-cols-2 gap-2">
              <Link to="/aptitude" onClick={onClose} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                 <Brain className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                 <span className="text-[7px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-600 transition-colors">Aptitude</span>
              </Link>
              <Link to="/interview" onClick={onClose} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-rose-200 transition-all group">
                 <Video className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                 <span className="text-[7px] font-black uppercase tracking-widest text-slate-300 group-hover:text-rose-500 transition-colors">Interview</span>
              </Link>
           </div>
        </div>

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
            <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.4em] text-rose-500 opacity-50">Admin</p>
            <Link
              to="/admin"
              onClick={onClose}
              className={`flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-300 group
                ${location.pathname.startsWith('/admin')
                  ? 'bg-rose-50 text-rose-700 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-rose-600 font-medium'
                }
              `}
            >
              <ShieldCheck className={`w-5 h-5 ${location.pathname.startsWith('/admin') ? 'text-rose-600' : 'group-hover:text-rose-600'}`} />
              <div className="flex flex-col">
                <span className="text-sm tracking-tight">Admin System</span>
              </div>
            </Link>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 space-y-2">
          <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-50">Legal & Support</p>
          <div className="grid grid-cols-2 gap-1 px-3">
             <Link to="/about" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest p-2">About Us</Link>
             <Link to="/contact" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest p-2 text-right">Contact</Link>
             <Link to="/support" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest p-2">Support</Link>
             <Link to="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest p-2 text-right">Privacy</Link>
          </div>
        </div>
      </nav>

      <div className="p-8 bg-slate-50 border-t border-slate-100">
        <button
          onClick={async () => await signOut()}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 border border-slate-200 font-semibold"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
}
