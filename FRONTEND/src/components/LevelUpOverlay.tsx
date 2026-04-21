import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LevelUpOverlayProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LevelUpOverlay({ level, isOpen, onClose }: LevelUpOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 500); // Allow exit animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-2xl"
        >
          {/* Particle System (Simplified Framer Motion) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50%', 
                  y: '50%', 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`, 
                  y: `${Math.random() * 100}%`, 
                  scale: Math.random() * 2,
                  opacity: 0 
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 bg-indigo-500 rounded-full"
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.1, y: -20, opacity: 0 }}
            className="relative z-10 text-center space-y-8 p-12"
          >
            <div className="relative inline-block">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute -inset-12 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
               ></motion.div>
               <div className="relative bg-gray-800 border-4 border-indigo-500/30 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(99,102,241,0.4)]">
                 <Trophy className="w-24 h-24 text-indigo-400 mx-auto animate-bounce" />
               </div>
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute -top-4 -right-4 bg-amber-500 text-slate-900 p-3 rounded-2xl shadow-xl border-4 border-gray-900"
               >
                 <Star className="w-6 h-6 fill-current" />
               </motion.div>
            </div>

            <div className="space-y-2">
               <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Evolution Complete</h2>
               <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-none">
                 Level <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{level}</span>
               </h1>
            </div>

            <p className="text-indigo-200/60 text-lg font-medium max-w-sm mx-auto leading-relaxed italic">
              "Your neural bandwidth has expanded. You have unlocked advanced strategic nodes and elite placement telemetry."
            </p>

            <div className="pt-8 flex justify-center gap-4">
               <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">+ Elite Clearance</span>
               </div>
               <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">+ Social Prestige</span>
               </div>
            </div>

            <button 
              onClick={() => setShow(false)}
              className="mt-12 flex items-center gap-3 mx-auto px-10 py-5 bg-white text-indigo-600 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Initialize Next Phase <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
