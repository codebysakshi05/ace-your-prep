import { TrendingUp, Sparkles, ChevronRight, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface AiMentorProps {
  stats: { title: string; value: number }[];
}

export function AiMentor({ stats }: AiMentorProps) {
  const navigate = useNavigate();

  const getGuidance = () => {
    if (!stats || stats.length === 0) return null;

    const activeStats = stats.filter(s => s.value > 0);
    const avgScore = activeStats.length
      ? activeStats.reduce((acc, curr) => acc + curr.value, 0) / activeStats.length
      : 0;

    const sorted = [...stats].sort((a, b) => a.value - b.value);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    if (avgScore === 0) {
      return {
        emoji: '👋',
        heading: "Welcome! Let's get started.",
        message: "You haven't completed any practice sessions yet. Start with an Aptitude test to set your baseline and unlock personalized recommendations.",
        tips: [
          { text: "Start your first Aptitude session", path: '/aptitude' },
          { text: "Try a Communication prompt", path: '/communication' },
          { text: "Explore all practice modules", path: '/practice' },
        ],
        type: 'start',
        accent: 'indigo',
        icon: Sparkles
      };
    }

    if (avgScore < 50) {
      return {
        emoji: '📌',
        heading: `Focus on ${weakest.title}`,
        message: `Your ${weakest.title} score is ${weakest.value}%, which is your weakest area right now. Focus here before moving on to harder content.`,
        tips: [
          { text: `Practice ${weakest.title} now`, path: weakest.title === 'Aptitude' ? '/aptitude' : weakest.title === 'GD Skills' ? '/gd-practice' : weakest.title === 'Interviews' ? '/interview' : '/communication' },
          { text: "Review your past answers", path: '/insights' },
          { text: "Try an easy warm-up session", path: '/practice' },
        ],
        type: 'critical',
        accent: 'rose',
        icon: AlertTriangle
      };
    }

    if (avgScore < 85) {
      return {
        emoji: '📈',
        heading: `You're progressing well!`,
        message: `Your ${strongest.title} is your best area at ${strongest.value}%. Push your ${weakest.title} (${weakest.value}%) to reach a balanced, placement-ready profile.`,
        tips: [
          { text: `Improve ${weakest.title}`, path: weakest.title === 'Aptitude' ? '/aptitude' : weakest.title === 'GD Skills' ? '/gd-practice' : weakest.title === 'Interviews' ? '/interview' : '/communication' },
          { text: "Try a full Mock Placement Test", path: '/practice' },
          { text: "Check your performance insights", path: '/insights' },
        ],
        type: 'improving',
        accent: 'indigo',
        icon: TrendingUp
      };
    }

    return {
      emoji: '🏆',
      heading: "You're placement-ready!",
      message: `Excellent work! Your average score of ${Math.round(avgScore)}% puts you ahead of most candidates. Keep practicing to stay sharp and maintain your edge.`,
      tips: [
        { text: "Take a timed Mock Test", path: '/practice' },
        { text: "Practice Group Discussion", path: '/gd-practice' },
        { text: "View your full dashboard", path: '/dashboard' },
      ],
      type: 'excellent',
      accent: 'emerald',
      icon: CheckCircle
    };
  };

  const guidance = getGuidance();
  if (!guidance) return null;

  const accentMap: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    rose: 'bg-rose-50 border-rose-200 text-rose-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  };
  const accentClasses = accentMap[guidance.accent] || accentMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium p-10 relative overflow-hidden bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center gap-5 mb-8">
        <div className={`p-4 rounded-2xl border-2 shadow-xl ${accentClasses}`}>
          <guidance.icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-[900] text-headingText uppercase tracking-tighter">AI Mentor</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] text-mutedText uppercase tracking-[0.2em] font-black">AI Analysis Active</span>
          </div>
        </div>
      </div>

      <div className={`p-8 rounded-[2rem] border-2 mb-8 ${accentClasses.split(' ').slice(1, 2).join(' ')} bg-surface/40 backdrop-blur-md`}>
        <div className="flex items-center gap-3 mb-4">
           <span className="text-2xl">{guidance.emoji}</span>
           <p className="text-[10px] font-black text-mutedText uppercase tracking-[0.4em]">{guidance.heading}</p>
        </div>
        <p className="text-base font-medium leading-relaxed text-mainText italic">
          "{guidance.message}"
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-mutedText uppercase tracking-[0.4em] flex items-center gap-3 mb-6">
          <Sparkles className="w-3 h-3 text-amber-500" /> Recommended Steps
        </h4>
        {guidance.tips.map((tip, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(tip.path)}
            className="w-full flex items-center gap-5 p-5 bg-surface/30 border-2 border-border rounded-2xl hover:border-primary/50 hover:bg-surface/80 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xs font-black group-hover:scale-110 transition-transform">
              {i + 1}
            </div>
            <span className="text-sm font-bold text-mainText group-hover:text-headingText flex-grow">{tip.text}</span>
            <ChevronRight className="w-4 h-4 text-mutedText group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-border">
        <button
          onClick={() => {
            const event = new CustomEvent('open-chatbot', {
              detail: { message: `I need help improving my ${stats.find(s => s.value === Math.min(...stats.map(s => s.value)))?.title || 'placement preparation'}. What should I focus on?` }
            });
            window.dispatchEvent(event);
          }}
          className="btn-wow w-full py-5 justify-center flex items-center gap-4 text-xs font-black uppercase tracking-widest"
        >
          <MessageSquare className="w-5 h-5" /> Ask Your Mentor
        </button>
      </div>
    </motion.div>
  );
}
