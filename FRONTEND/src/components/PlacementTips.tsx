import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, AlertCircle, CheckCircle, 
  ChevronRight, X, Info, HelpCircle
} from 'lucide-react';

export type TipCategory = 'aptitude' | 'gd' | 'interview' | 'communication' | 'email';

interface PlacementTipsProps {
  category: TipCategory;
  isOpen: boolean;
  onClose: () => void;
}

const TIPS_DATA: Record<TipCategory, { title: string; tips: string[]; mistakes: string[] }> = {
  aptitude: {
    title: 'Aptitude Mastery',
    tips: [
      'Master the basics: Strengthen your foundation in Vedic math and common formulas.',
      'Time management: Don\'t spend more than 1 minute on a single question.',
      'Process of elimination: Use options to narrow down the correct answer.',
      'Identify weak areas: Focus on topics where you take the most time.'
    ],
    mistakes: [
      'Skipping the question reading: Missing small details like "not" or "except".',
      'Getting emotionally attached: Spending too much time trying to solve a hard question.',
      'Calculation errors: Avoid mental math for complex steps.'
    ]
  },
  gd: {
    title: 'Group Discussion Success',
    tips: [
      'Body Language: Sit straight, maintain eye contact, and nod when others speak.',
      'Initiate with clarity: Start only if you have a strong opening point.',
      'Active Listening: Refer to others\' points by name to show collaboration.',
      'Structural thinking: Use the PESTEL (Political, Economic, Social...) framework.'
    ],
    mistakes: [
      'Dominating the talk: Speaking too much and not letting others contribute.',
      'Aggressive behavior: Cutting others off or being confrontational.',
      'Lack of content: Speaking just to speak without adding value.'
    ]
  },
  interview: {
    title: 'Interview Preparation',
    tips: [
      'STAR Method: Structure your answers using Situation, Task, Action, and Result.',
      'Research the company: Know their products, culture, and recent news.',
      'Dress Professionally: Your first impression is your most lasting one.',
      'Ask insightful questions: Show curiosity about the role and team growth.'
    ],
    mistakes: [
      'Being generic: Giving "copy-paste" answers instead of personal examples.',
      'Badmouthing past employers: Always stay positive and professional.',
      'Not practicing mock sessions: Your first "real" interview shouldn\'t be your first time speaking.'
    ]
  },
  communication: {
    title: 'Professional Communication',
    tips: [
      'Clarity over complexity: Use simple language to convey complex ideas.',
      'Tone awareness: Adapt your tone to the situation (formal vs. semi-formal).',
      'Confidence: Maintain a steady pace and avoid excessive filler words (um, like).',
      'Non-verbal cues: Hand gestures can help emphasize points when used moderately.'
    ],
    mistakes: [
      'Speaking too fast: Makes it hard for the listener to follow your logic.',
      'Avoiding eye contact: Projects lack of confidence or interest.',
      'Ignoring feedback: Not adjusting your style based on the listener\'s response.'
    ]
  },
  email: {
    title: 'Professional Email Writing',
    tips: [
      'Concise Subject Lines: Be clear (e.g., "Job Application - [Name]").',
      'Formal Salutations: Use "Dear Mr./Ms. [Name]" or "Dear Hiring Manager".',
      'Proofread twice: Typos in an email signal a lack of attention to detail.',
      'Professional Signature: Include your phone and LinkedIn profile link.'
    ],
    mistakes: [
      'Using informal language: Avoid "plz", "tks", or "hey" in professional emails.',
      'Missing attachments: Referencing a resume but forgetting to attach it.',
      'Long paragraphs: Keep it direct; use bullet points for lists.'
    ]
  }
};

export function PlacementTips({ category, isOpen, onClose }: PlacementTipsProps) {
  const data = TIPS_DATA[category];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
            
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-white/5 rounded-2xl">
                    <Lightbulb className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{data.title}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert Advice & Guidelines</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Top Tips</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.tips.map((tip, i) => (
                      <div key={i} className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl flex gap-3">
                        <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Common Mistakes</h3>
                  </div>
                  <div className="space-y-3">
                    {data.mistakes.map((mistake, i) => (
                      <div key={i} className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-2xl flex gap-3 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <p className="text-xs font-bold text-rose-800 dark:text-rose-200">{mistake}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-center">
                <button 
                  onClick={onClose}
                  className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
