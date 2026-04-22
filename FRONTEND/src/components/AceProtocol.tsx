import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Activity, Zap, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AceProtocolProps {
  isOpen: boolean;
  onComplete: () => void;
  sessionName: string;
}

export function AceSessionStart({ isOpen, onComplete, sessionName }: AceProtocolProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const protocolLogs = [
    'Connecting to learning system...',
    'Analyzing your progress...',
    'Preparing test material...',
    'Setting up practice environment...',
    'System ready. Good luck!'
  ];

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setLogs([]);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      // Add logs sequentially
      protocolLogs.forEach((log, i) => {
        setTimeout(() => {
          setLogs(prev => [...prev, `[ACE-SYS] ${log}`]);
        }, i * 400);
      });

      return () => clearInterval(interval);
    }
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-3xl overflow-hidden"
        >
          {/* Scanning Line */}
          <motion.div 
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.5)] z-20"
          />

          {/* Core Visual */}
          <div className="relative mb-20">
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="w-64 h-64 border-[1px] border-indigo-500/20 rounded-full border-dashed"
             />
             
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative group">
                   <div className="absolute -inset-10 bg-indigo-600/20 blur-3xl animate-pulse" />
                   <div className="relative w-24 h-24 bg-slate-900 border-2 border-indigo-500/50 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                      <Sparkles className="w-12 h-12 text-indigo-400" />
                      <div className="absolute -top-1 -right-1">
                         <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                         <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Text Info */}
          <div className="text-center space-y-6 max-w-md w-full px-10 relative z-10">
             <div className="space-y-2">
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] animate-pulse">Starting Practice Session</h2>
                <h1 className="text-4xl font-[900] text-white tracking-tighter uppercase italic">
                   {sessionName} <span className="text-indigo-400">Mode</span>
                </h1>
             </div>

             {/* Progress Bar */}
             <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loading Content</span>
                   <span className="text-xs font-black text-white tabular-nums">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                   />
                </div>
             </div>

             {/* System Logs */}
             <div className="h-24 overflow-hidden text-left bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[9px] space-y-1.5 shadow-inner">
                <AnimatePresence>
                   {logs.map((log, i) => (
                     <motion.div
                       key={i}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="text-indigo-300/60"
                     >
                       <span className="text-indigo-500/40 mr-2">{'>'}</span> {log}
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>

          {/* Floating HUD Elements */}
          <HUDElement icon={Activity} label="Status" value="Optimal" position="top-20 left-20" color="text-emerald-500" />
          <HUDElement icon={Zap} label="Speed" value="Active" position="top-40 right-20" color="text-amber-500" />
          <HUDElement icon={Shield} label="System" value="Secure" position="bottom-20 left-20" color="text-indigo-500" />
          <HUDElement icon={Sparkles} label="Learning" value="Ready" position="bottom-40 right-20" color="text-cyan-500" />

        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HUDElement({ icon: Icon, label, value, position, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute ${position} hidden lg:flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md`}
    >
       <div className={`p-2 rounded-xl bg-slate-900 border border-white/5 ${color}`}>
          <Icon className="w-4 h-4" />
       </div>
       <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{value}</p>
       </div>
    </motion.div>
  );
}
