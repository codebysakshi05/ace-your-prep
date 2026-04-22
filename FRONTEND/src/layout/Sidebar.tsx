import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  Video,
  Map as MapIcon,
  ShieldCheck,
  Trophy,
  TrendingUp,
  Award,
  LogOut,
  Zap,
  Sparkles,
  MessageSquare,
  Users,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { databaseService } from '../services/databaseService';
import { motion } from 'framer-motion';

const NAV_SECTIONS = [
  {
    label: 'Practice',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Practice Hub', path: '/practice', icon: Sparkles },
      { name: 'Success Path', path: '/mission-room', icon: Zap },
    ],
  },
  {
    label: 'Modules',
    items: [
      { name: 'Aptitude Training', path: '/aptitude', icon: Brain },
      { name: 'Interview Preparation', path: '/interview', icon: Video },
      { name: 'Communication Skills', path: '/communication', icon: MessageSquare },
      { name: 'Email Writing', path: '/email-writing', icon: Sparkles },
      { name: 'GD Practice', path: '/gd-practice', icon: Users },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Insights', path: '/insights', icon: TrendingUp },
      { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
      { name: 'Roadmap', path: '/roadmap', icon: MapIcon },
      { name: 'Resume Builder', path: '/resume-builder', icon: Award },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (user?.id) {
      databaseService.fetchUserStats(user.id)
        .then(setStats)
        .catch(() => setStats({ aptitude: 0, communication: 0, gd: 0, interview: 0 }));
    }
  }, [user]);

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpProgress = xp % 100;

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full overflow-hidden transition-colors duration-300">
      {/* Brand */}
      <div className="p-5 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-headingText text-base">Ace It Up</span>
        </Link>
      </div>

      {/* User card */}
      <div className="p-4 border-b border-slate-100">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-headingText leading-tight truncate">
                {profile?.full_name?.split(' ')[0] || 'Student'}
              </p>
              <p className="text-xs text-mutedText">Level {level} · {xp} XP</p>
            </div>
          </div>
          {/* XP bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>XP Progress</span>
              <span>{xpProgress}/100</span>
            </div>
            <div className="h-1.5 bg-white rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                      ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-mutedText hover:bg-surface/50 hover:text-headingText'
                      }`}
                  >
                    <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-mutedText group-hover:text-headingText'}`} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin */}
        {isAdmin && (
          <div>
            <p className="px-3 mb-2 text-[10px] font-semibold text-rose-400 uppercase tracking-widest">Admin</p>
            <Link
              to="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${location.pathname.startsWith('/admin')
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <ShieldCheck className="w-4.5 h-4.5 text-rose-400" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'obsidian' ? 'phantom-white' : 'obsidian')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-mutedText hover:bg-surface/50 transition-colors"
        >
          {theme === 'obsidian' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-mutedText" />}
          {theme === 'obsidian' ? 'Light Mode' : 'Dark Mode'}
        </button>
        {/* Logout */}
        <button
          onClick={async () => await signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-mutedText hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
