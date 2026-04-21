import { motion } from 'framer-motion';
import { Target, Users, Award, ShieldCheck, Sparkles, Brain } from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Active Learners', value: '10K+', icon: Users, color: 'text-indigo-600' },
    { label: 'Success Rate', value: '94%', icon: Target, color: 'text-emerald-600' },
    { label: 'Practice Questions', value: '5000+', icon: Brain, color: 'text-amber-600' },
    { label: 'Placement Partners', value: '50+', icon: Award, color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Our Vision</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none"
          >
            Engineering the Future of <span className="text-indigo-600">Placement Preparation</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Ace It Up is a premium training ecosystem designed to bridge the gap between academic learning and corporate excellence.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-premium p-8 text-center bg-white border-slate-100 shadow-sm"
            >
              <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-4`} />
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">The Ace It Up Story</h2>
            <div className="space-y-6 text-slate-500 text-lg leading-relaxed font-medium">
              <p>
                Founded in 2024, Ace It Up started with a simple problem: placement prep was fragmented, repetitive, and uninspiring. We set out to build a platform that feels as premium as the companies you're aiming for.
              </p>
              <p>
                Today, we use adaptive learning algorithms and industry-standard analytics to give every student a personalized roadmap to their dream career.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-indigo-600" />
                 <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Verified Content</span>
              </div>
              <div className="flex items-center gap-3">
                 <Sparkles className="w-5 h-5 text-indigo-600" />
                 <span className="text-xs font-black text-slate-900 uppercase tracking-widest">AI Insights</span>
              </div>
            </div>
          </div>
          <div className="aspect-square bg-indigo-50 rounded-[4rem] border-8 border-white shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 group-hover:opacity-10 transition-opacity"></div>
             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Team Work" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>

        {/* Values */}
        <div className="glass-premium p-16 bg-white border-slate-100 shadow-xl space-y-12">
            <div className="text-center space-y-4">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Our Core Values</h3>
               <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">01</div>
                  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Standardization</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">We maintain elite quality benchmarks across all our modules to match global industry standards.</p>
               </div>
               <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black">02</div>
                  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Adaptivity</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Our Learning Engine evolves with you, ensuring you're always challenged but never overwhelmed.</p>
               </div>
               <div className="space-y-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-black">03</div>
                  <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Transparency</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">We provide raw, honest data about your performance so you know exactly where you stand.</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
