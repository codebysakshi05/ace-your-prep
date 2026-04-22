import { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, user } = useAuth();
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-surface border-b border-border sticky top-0 z-10 w-full transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('ace-open-command-palette'))}
          className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-56 lg:w-72 cursor-pointer hover:border-indigo-300 transition-all group"
        >
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
          <div className="text-sm text-slate-400 select-none">
            Search modules...
          </div>
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 ml-auto">
            <span className="text-[11px]">⌘</span>K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-heading leading-tight">
              {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted">
              Lv. {profile?.level || 1} · {profile?.xp || 0} XP
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
