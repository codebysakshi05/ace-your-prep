import { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, user } = useAuth();
  
  const [startTime] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setSessionDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-background/80 border-b border-border backdrop-blur-md sticky top-0 z-10 w-full transition-colors duration-500 overflow-hidden">
      {/* Global Progress Horizon */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200/20">
         <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 w-1/3 animate-pulse"></div>
      </div>

      {/* 🚀 System Telemetry */}
      <div className="flex items-center gap-4 md:gap-8">
         <button className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors" onClick={onMenuClick}>
           <Menu className="w-6 h-6" />
         </button>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-neural-pulse"></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">System Status</p>
               <p className="text-[11px] font-black text-emerald-600 uppercase leading-none mt-1.5">Live Syncing</p>
            </div>
          </div>
         <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
         <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Session Intensity</p>
            <p className="text-[11px] font-black text-slate-900 uppercase leading-none mt-1.5 tabular-nums">{sessionDuration}</p>
         </div>
      </div>

      <div className="flex items-center gap-6">
         <div className="hidden lg:block">
            <ThemeToggle />
         </div>
         <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-200">
           <Bell className="w-5 h-5" />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
         </button>
         
         <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
           <div className="flex flex-col items-end hidden md:block">
             <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{profile?.full_name || user?.email?.split('@')[0]}</p>
             <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-none opacity-50">Verified Candidate</p>
           </div>
           <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center p-0.5 shadow-xl group cursor-pointer hover:scale-110 transition-transform">
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center text-xs font-black text-slate-900">
                 {profile?.full_name?.charAt(0) || 'U'}
              </div>
           </div>
         </div>
      </div>
    </header>
  );
}
