import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, ChevronRight, Brain, 
  TrendingUp, MessageSquare, Zap, Rocket 
} from 'lucide-react';
import { intelligenceService } from '../services/intelligenceService';
import type { Recommendation } from '../services/intelligenceService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AiMentorPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && isOpen) {
      loadRecommendations();
    }
  }, [user, isOpen]);

  const loadRecommendations = async () => {
    setLoading(true);
    const recs = await intelligenceService.generateRecommendations(user!.id);
    setRecommendations(recs);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-indigo-600 text-white rounded-3xl shadow-2xl flex items-center justify-center group hover:bg-indigo-500 transition-all border-4 border-white/20"
        >
          <Sparkles className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {recommendations.length || 3}
          </div>
        </motion.button>
      )}

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[120] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] border-l border-slate-100 flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xl">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">AI Mentor Terminal</h2>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Synched Logic v3.0</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                        <div className="flex-grow space-y-2 pt-2">
                          <div className="h-4 bg-slate-100 rounded w-2/3" />
                          <div className="h-3 bg-slate-50 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[.3em]">Critical Synapses</h3>
                      <div className="space-y-4">
                        {recommendations.map((rec) => (
                          <motion.div
                            key={rec.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                              navigate(rec.path);
                              setIsOpen(false);
                            }}
                            className={`p-6 rounded-[2rem] border transition-all cursor-pointer group
                              ${rec.priority === 'high' ? 'bg-rose-50 border-rose-100 hover:bg-rose-100' : 
                                rec.priority === 'medium' ? 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100' : 
                                'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                               <div className={`p-2.5 rounded-xl ${rec.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                  <Zap className="w-5 h-5" />
                               </div>
                               <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md
                                ${rec.priority === 'high' ? 'bg-rose-200 text-rose-700' : 'bg-indigo-200 text-indigo-700'}`}>
                                 {rec.priority} Priority
                               </span>
                            </div>
                            <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 mb-2">{rec.title}</h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed">{rec.desc}</p>
                            <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execute Node</span>
                               <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Rocket className="w-32 h-32" />
                       </div>
                       <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-indigo-400" /> Skill Calibration
                       </h3>
                       <p className="text-slate-400 text-xs leading-relaxed mb-6">
                         Your overall placement authority has increased by <span className="text-emerald-400 font-bold">12%</span> this week. Keep up the high intensity.
                       </p>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '72%' }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50">
                 <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3">
                   <MessageSquare className="w-5 h-5" /> Start AI Inquiry
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
