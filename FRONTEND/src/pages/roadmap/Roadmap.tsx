import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, CheckCircle, ChevronRight, Zap, Trophy, 
  Target, Rocket, Shield, Brain, Star 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RoadmapNode {
  id: number;
  title: string;
  desc: string;
  requirement: string;
  minLevel: number;
  icon: any;
  type: 'core' | 'milestone' | 'legend';
}

const ROADMAP_NODES: RoadmapNode[] = [
  { id: 1, title: 'The Apprentice', desc: 'Set up your profile and complete your first aptitude test.', requirement: 'Complete 1 Aptitude Test', minLevel: 1, icon: Star, type: 'core' },
  { id: 2, title: 'Logical Navigator', desc: 'Master the fundamentals of reasoning and pattern recognition.', requirement: 'Score > 60% in Logic', minLevel: 2, icon: Brain, type: 'core' },
  { id: 3, title: 'Communication Hub', desc: 'Break the silence. Complete your first 5 speaking prompts.', requirement: 'XP > 1000', minLevel: 3, icon: Zap, type: 'milestone' },
  { id: 4, title: 'Candidate Tier', desc: 'Establish a balanced professional baseline across all training modules.', requirement: 'All scores > 50%', minLevel: 4, icon: Target, type: 'core' },
  { id: 5, title: 'Expert Zone', desc: 'Unlock high-difficulty challenges and advanced interview preparation.', requirement: 'Level 6 Reach', minLevel: 6, icon: Shield, type: 'core' },
  { id: 6, title: 'Placement Legend', desc: 'The final threshold. Reach top-tier status for elite company screenings.', requirement: 'Total XP > 5000', minLevel: 10, icon: Rocket, type: 'legend' },
];

export function Roadmap() {
  const { profile } = useAuth();
  const [activeNode, setActiveNode] = useState<number>(1);
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);

  useEffect(() => {
    if (profile) {
      // Basic auto-completion logic based on level
      const completed = ROADMAP_NODES.filter(n => (profile.level || 1) >= n.minLevel).map(n => n.id);
      setCompletedNodes(completed);
      setActiveNode(Math.min(6, (completed[completed.length - 1] || 0) + 1));
    }
  }, [profile]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-12 pb-20 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
          <Trophy className="w-3.5 h-3.5" /> Career Success Path
        </div>
        <h1 className="text-5xl font-black text-headingText tracking-tighter">Your <span className="text-primary">Roadmap.</span></h1>
        <p className="text-mutedText text-lg font-medium max-w-xl mx-auto">Track your progression from an Apprentice to a Placement Legend through clear milestones.</p>
      </div>

      <div className="relative mt-20">
        {/* Connection Line */}
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 -translate-x-1/2 rounded-full overflow-hidden">
             <motion.div 
               initial={{ height: 0 }}
               animate={{ height: `${(completedNodes.length / ROADMAP_NODES.length) * 100}%` }}
               className="w-full bg-gradient-to-b from-indigo-500 to-cyan-400"
             />
        </div>

        <div className="space-y-16">
          <AnimatePresence>
            {ROADMAP_NODES.map((node, idx) => {
              const isCompleted = completedNodes.includes(node.id);
              const isLocked = (profile?.level || 1) < node.minLevel;
              const isActive = activeNode === node.id;

              return (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-8 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Visual Connector / Bubble */}
                  <div className="w-20 md:w-1/2 flex justify-center relative z-10">
                     <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl 
                      ${isCompleted ? 'bg-indigo-600 text-white animate-float' : 
                        isLocked ? 'bg-slate-100 text-slate-400' : 
                        'bg-white border-4 border-indigo-500 text-indigo-600 scale-110 shadow-indigo-200'}`}
                     >
                       {isLocked ? <Lock className="w-6 h-6" /> : <node.icon className="w-8 h-8" />}
                     </div>
                     
                     {isActive && !isLocked && (
                        <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse -z-10" />
                     )}
                  </div>

                  {/* Content Card */}
                  <div className="flex-grow md:w-1/2">
                     <div className={`p-8 rounded-[2rem] border transition-all duration-300 group
                      ${isCompleted ? 'bg-white border-slate-200 shadow-sm' : 
                        isLocked ? 'bg-slate-50/50 border-transparent opacity-60 grayscale' : 
                        'bg-white border-indigo-200 shadow-xl shadow-indigo-100 scale-[1.02]'}`}
                     >
                        <div className="flex justify-between items-start mb-4">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg
                            ${isCompleted ? 'text-emerald-600 bg-emerald-50' : 
                              isLocked ? 'text-slate-400 bg-slate-100' : 'text-indigo-600 bg-indigo-50 animate-pulse'}`}
                           >
                             {isCompleted ? 'Milestone Completed' : isLocked ? `Locked: LVL ${node.minLevel}` : 'Current Objective'}
                           </span>
                           {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{node.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">{node.desc}</p>
                        
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <Target className="w-3.5 h-3.5" /> {node.requirement}
                           </div>
                           {!isLocked && !isCompleted && (
                              <button className="text-xs font-black text-primary flex items-center gap-2 group/btn">
                                 Start Milestone <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-all" />
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
         {[
           { label: 'Current Phase', value: ROADMAP_NODES[activeNode - 1]?.title || 'Finalizing', icon: Star, color: 'text-indigo-600' },
           { label: 'Total Points', value: `${profile?.xp || 0} XP`, icon: Zap, color: 'text-amber-500' },
           { label: 'Rank Status', value: (profile?.level || 1) >= 10 ? 'Placement Legend' : 'Candidate', icon: Trophy, color: 'text-emerald-500' }
         ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
               <div className="flex items-center gap-4 mb-3">
                  <div className={`p-2 bg-slate-50 rounded-xl ${stat.color}`}>
                     <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
               </div>
               <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
         ))}
      </div>
    </div>
  );
}
