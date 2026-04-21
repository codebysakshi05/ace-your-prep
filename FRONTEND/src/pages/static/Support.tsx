import { useState } from 'react';
import { Search, HelpCircle, MessageSquare, BookOpen, ChevronRight, Zap, PlayCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Support() {
  const [search, setSearch] = useState('');

  const faqs = [
    { q: "How do I reset my Learning Path?", a: "Go to Dashboard > Performance level and select 'Re-calibrate' to reset your metrics." },
    { q: "Can I practice for specific companies?", a: "Yes, use the Placement Matrix in the Practice Hub to select industry-specific benchmarks." },
    { q: "How are my scores calculated?", a: "We use an weighted average of accuracy, response time, and consistency across all training cycles." },
    { q: "Is there a limit to daily practice?", a: "Free tier modules have a daily limit, but Elite members have unlimited access to all terminals." }
  ];

  const categories = [
    { title: 'Training Basics', icon: BookOpen, count: 12 },
    { title: 'Technical Help', icon: Zap, count: 8 },
    { title: 'Auth & Profile', icon: FileText, count: 5 },
    { title: 'Session Rules', icon: PlayCircle, count: 10 }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Search Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl rotate-3">
               <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-4">
             <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Support Hub</h1>
             <p className="text-slate-500 font-medium text-lg">Knowledge base and technical assistance for all prep modules.</p>
          </div>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-6 top-5 w-6 h-6 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for terminal help, rules, or guides..."
              className="w-full pl-16 pr-8 py-5 !rounded-full shadow-lg shadow-indigo-500/5 focus:shadow-indigo-500/10 border-slate-200"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.button 
              key={i}
              whileHover={{ y: -5 }}
              className="glass-premium p-8 text-left bg-white border-slate-100 shadow-sm hover:shadow-lg transition-all group"
            >
              <cat.icon className="w-8 h-8 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{cat.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{cat.count} Articles</p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
          {/* FAQ Column */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
               <BookOpen className="w-6 h-6 text-indigo-600" /> Common Questions
            </h2>
            <div className="space-y-4">
               {faqs.map((faq, i) => (
                 <div key={i} className="glass-premium p-8 bg-white border-slate-100 shadow-sm hover:border-indigo-100 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{faq.q}</h4>
                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Contact Cards */}
          <div className="space-y-6">
             <div className="glass-premium p-10 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                   <MessageSquare className="w-16 h-16" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">Direct Support</h3>
                <p className="text-indigo-100/80 text-xs font-medium mb-8 leading-relaxed relative z-10">Can't find what you need in the logs? Our advisors are ready to optimize your preparation path.</p>
                <button className="w-full py-4 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all shadow-lg relative z-10">Open Support Ticket召</button>
             </div>

             <div className="glass-premium p-10 bg-white border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Feedback Loop</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">Suggest a new question or report a logic error in our training cycles.</p>
                <button className="w-full py-4 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">Submit Feedback</button>
             </div>
          </div>
        </div>

        <div className="text-center pt-12 border-t border-slate-100">
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Ace It Up Protocol • V2.0 Operational</p>
        </div>
      </div>
    </div>
  );
}
