import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpOverlayProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LevelUpOverlay({ level, isOpen, onClose }: LevelUpOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti explosion
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ 
            ...defaults, 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        });
        confetti({ 
            ...defaults, 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-white border border-slate-200 rounded-[3.5rem] p-12 md:p-20 max-w-2xl w-full text-center relative overflow-hidden shadow-2xl"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
              <Trophy className="w-full h-full text-indigo-600 scale-150 rotate-12" />
            </div>

            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>

            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-amber-500/40 relative"
            >
              <Star className="w-16 h-16 md:w-20 md:h-20 text-white fill-white animate-pulse" />
              <div className="absolute -top-4 -right-4 bg-white text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 border-indigo-50">
                {level}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> New Rank Achieved
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                System <span className="text-gradient-premium">Level Up!</span>
              </h2>
              
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto">
                Excellent performance! Your neural proficiency level is now <strong className="text-slate-900">Rank {level}</strong>. 
                Keep training to unlock elite placement tiers.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-10">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Peak</p>
                  <p className="text-2xl font-black text-slate-900">LVL {level}</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Bonus</p>
                  <p className="text-2xl font-black text-indigo-600">+500 XP</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
              >
                Continue Training Cycle
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
