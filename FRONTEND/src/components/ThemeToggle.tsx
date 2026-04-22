import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode } from '../contexts/ThemeContext';
import { Sun, Moon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; icon: any; label: string; color: string }[] = [
    { id: 'phantom-white', icon: Sun, label: 'Light', color: 'text-amber-500' },
    { id: 'obsidian', icon: Moon, label: 'Dark', color: 'text-indigo-400' },
    { id: 'cyber-neon', icon: Zap, label: 'Cyber', color: 'text-cyan-400' },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`relative p-2.5 rounded-xl transition-all group ${
            theme === t.id 
              ? 'bg-white shadow-xl shadow-black/10' 
              : 'hover:bg-white/5'
          }`}
          title={t.label}
        >
          <t.icon className={`w-4 h-4 transition-colors ${theme === t.id ? 'stroke-[3px] ' + t.color : 'text-slate-400'}`} />
          
          {theme === t.id && (
            <motion.div
              layoutId="active-theme"
              className="absolute inset-0 bg-white rounded-xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}

          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl">
            {t.label} Mode
          </div>
        </button>
      ))}
    </div>
  );
}
