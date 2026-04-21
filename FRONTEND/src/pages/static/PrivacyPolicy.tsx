import { Shield, Lock, Eye, FileText, Globe, Clock } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'Data Collection Protocol',
      icon: Eye,
      content: 'We collect performance metadata, including question response times and accuracy metrics, to power your adaptive Learning Engine.'
    },
    {
      title: 'Identity Verification',
      icon: Shield,
      content: 'Your account credentials and profile data are encrypted and stored securely via Supabase Auth services.'
    },
    {
      title: 'Third-Party Access',
      icon: Globe,
      content: 'We do not sell your data. We share anonymized performance trends with our corporate partners only with your explicit consent.'
    },
    {
      title: 'Security Standard',
      icon: Lock,
      content: 'We utilize industry-standard TLS encryption for all data transmissions and periodic security audits of our PostgreSQL schema.'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Secure Node</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Privacy Policy</h1>
          <p className="text-slate-500 font-medium flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Last Updated: April 2024
          </p>
        </div>

        <div className="glass-premium p-10 md:p-16 bg-white border-slate-100 shadow-xl space-y-16">
          <div className="space-y-8">
             <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Platform Governance</h2>
             </div>
             <p className="text-slate-500 text-lg leading-relaxed font-medium">
               At Ace It Up, we prioritize the integrity of your professional data. This policy outlines how we manage your training metrics and personal identity within our training ecosystem.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
            {sections.map((s, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-700 shadow-sm">
                   <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100 space-y-6">
             <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Data Retention</h4>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">
               Your training logs and performance benchmarks are retained as long as your profile remains active. You may request a complete erasure of your identity vector at any time via the Support hub.
             </p>
             <div className="flex gap-4">
               <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Download Data Log</button>
               <button className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline">Request Erasure</button>
             </div>
          </div>
        </div>

        <div className="text-center">
           <p className="text-xs font-medium text-slate-400 italic">
             "By continuing to prepare with Ace It Up, you agree to the protocols outlined in this identity management document."
           </p>
        </div>
      </div>
    </div>
  );
}
