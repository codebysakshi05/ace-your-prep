import { motion } from 'framer-motion';
import { Award, Zap, ShieldCheck, Target, Shell, Star, Crown, Brain, Video, Users, MessageSquare } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked_at?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

const RARITY_STYLES = {
  common: 'from-slate-400 to-slate-500 border-slate-300 shadow-slate-200',
  rare: 'from-indigo-400 to-indigo-600 border-indigo-300 shadow-indigo-300/30',
  epic: 'from-purple-500 to-purple-700 border-purple-400 shadow-purple-500/30',
  legendary: 'from-amber-400 to-amber-600 border-amber-300 shadow-amber-500/40'
};

const CATEGORY_ICONS: Record<string, any> = {
  aptitude: Brain,
  interview: Video,
  gd: Users,
  communication: MessageSquare,
  speed: Zap,
  streak: Shell,
  master: Crown,
  verified: ShieldCheck,
  goal: Target
};

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = CATEGORY_ICONS[achievement.id.split('_')[0]] || Award;
  const rarity = achievement.rarity || 'common';
  const style = RARITY_STYLES[rarity];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative w-full p-8 rounded-[2.5rem] bg-gradient-to-br ${style} border-t-2 text-white shadow-2xl overflow-hidden group cursor-default`}
    >
      {/* ── Background Patterns ── */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
         <Icon className="w-40 h-40" />
      </div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* ── Content ── */}
      <div className="relative z-10 space-y-6">
         <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
               <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               <p className="text-[8px] font-black uppercase tracking-widest">{rarity} Authority</p>
            </div>
         </div>

         <div>
            <h4 className="text-xl font-black tracking-tight leading-none mb-2 group-hover:translate-x-1 transition-transform">
               {achievement.name}
            </h4>
            <p className="text-[10px] font-medium text-white/70 leading-relaxed max-w-[80%]">
               {achievement.description}
            </p>
         </div>

         <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <div className="flex flex-col">
               <p className="text-[7px] font-black uppercase tracking-widest opacity-50">Authenticated On</p>
               <p className="text-[9px] font-bold">
                 {achievement.unlocked_at ? new Date(achievement.unlocked_at).toLocaleDateString() : 'Pending Execution'}
               </p>
            </div>
            <div className="p-2 bg-white/10 rounded-xl">
               <Star className="w-4 h-4 fill-current text-white/50" />
            </div>
         </div>
      </div>

      {/* ── Glass Shimmer Effect ── */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  );
}
