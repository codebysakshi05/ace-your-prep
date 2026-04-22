import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, Zap, LayoutDashboard, Brain, Users, 
  MessageSquare, Video, Map, TrendingUp, Trophy, Award, 
  Terminal, Shield, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const NAV_ITEMS = [
  { name: 'Mission Room', path: '/mission-room', icon: Zap, category: 'Elite' },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { name: 'Aptitude Test', path: '/aptitude', icon: Brain, category: 'Modules' },
  { name: 'GD Practice', path: '/gd-practice', icon: Users, category: 'Modules' },
  { name: 'Communication', path: '/communication', icon: MessageSquare, category: 'Modules' },
  { name: 'Interview Pro', path: '/interview-pro', icon: Video, category: 'Modules' },
  { name: 'Neural Path', path: '/roadmap', icon: Map, category: 'Navigation' },
  { name: 'Growth Insights', path: '/insights', icon: TrendingUp, category: 'Analytics' },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, category: 'Social' },
  { name: 'Resume Architect', path: '/resume-builder', icon: Award, category: 'Career' },
];

const THEME_COMMANDS = [
  { name: 'Protocol: Obsidian Blue', value: 'obsidian', icon: Moon, category: 'System' },
  { name: 'Protocol: Cyber Neon', value: 'cyber-neon', icon: Zap, category: 'System' },
  { name: 'Protocol: Phantom White', value: 'phantom-white', icon: Shield, category: 'System' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ace-open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ace-open-command-palette', handleOpen);
    };
  }, []);

  const filteredItems = NAV_ITEMS.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredThemes = THEME_COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-surface border border-border rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
        >
          <div className="flex items-center gap-4 px-8 py-6 border-b border-border bg-surface/50">
             <Search className="w-6 h-6 text-primary" />
             <input 
               autoFocus
               placeholder="Execute command or navigate..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-transparent border-none p-0 text-lg font-bold text-headingText placeholder-mutedText focus:ring-0 w-full"
             />
             <div className="flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-lg text-[10px] font-black text-mutedText uppercase tracking-widest">
                ESC
             </div>
          </div>

          <div className="px-4 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
             {filteredItems.length > 0 && (
               <div className="mb-8">
                  <p className="px-4 mb-4 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Terminals</p>
                  <div className="space-y-1">
                     {filteredItems.map(item => (
                       <button 
                         key={item.path}
                         onClick={() => { navigate(item.path); setIsOpen(false); }}
                         className="w-full flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-primary/10 transition-all group"
                       >
                          <div className="flex items-center gap-5">
                             <item.icon className="w-5 h-5 text-mutedText group-hover:text-primary transition-colors" />
                             <span className="text-sm font-black text-headingText tracking-tight">{item.name}</span>
                          </div>
                          <span className="text-[9px] font-bold text-mutedText uppercase tracking-widest group-hover:text-primary/60">{item.category}</span>
                       </button>
                     ))}
                  </div>
               </div>
             )}

             {filteredThemes.length > 0 && (
               <div>
                  <p className="px-4 mb-4 text-[10px] font-black text-accent uppercase tracking-[0.3em]">Protocol Overrides</p>
                  <div className="space-y-1">
                     {filteredThemes.map(cmd => (
                       <button 
                         key={cmd.value}
                         onClick={() => { setTheme(cmd.value as any); setIsOpen(false); }}
                         className="w-full flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-accent/10 transition-all group"
                       >
                          <div className="flex items-center gap-5">
                             <cmd.icon className="w-5 h-5 text-mutedText group-hover:text-accent transition-colors" />
                             <span className="text-sm font-black text-headingText tracking-tight">{cmd.name}</span>
                          </div>
                          <span className="text-[9px] font-bold text-mutedText uppercase tracking-widest group-hover:text-accent/60">System</span>
                       </button>
                     ))}
                  </div>
               </div>
             )}

             {filteredItems.length === 0 && filteredThemes.length === 0 && (
               <div className="text-center py-20">
                  <Terminal className="w-16 h-16 text-mutedText/20 mx-auto mb-6" />
                  <p className="text-xs font-black text-mutedText/40 uppercase tracking-[0.4em]">Signal Failure: No Command Found</p>
               </div>
             )}
          </div>

          <div className="px-8 py-5 bg-surface/80 border-t border-border flex items-center justify-between">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                   <div className="px-2 py-1 bg-surface border border-border rounded text-[9px] font-black text-mutedText">↑↓</div>
                   <span className="text-[9px] font-black text-mutedText/60 uppercase tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-2 py-1 bg-surface border border-border rounded text-[9px] font-black text-mutedText">Enter</div>
                   <span className="text-[9px] font-black text-mutedText/60 uppercase tracking-widest">Execute</span>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Command className="w-4 h-4 text-mutedText/40" />
                <span className="text-[10px] font-black text-mutedText/40 uppercase tracking-widest leading-none">Neural Core v2.0</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
