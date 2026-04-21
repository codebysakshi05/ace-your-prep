import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Column: Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Get in <span className="text-indigo-600">Touch</span>.</h1>
              <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                Have questions about our training modules or corporate partnerships? Our team is here to help you Ace It Up.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                   <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Email Support</p>
                  <p className="text-xl font-bold text-slate-900">support@aceitup.ai</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                   <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Corporate Inquiries</p>
                  <p className="text-xl font-bold text-slate-900">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                   <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Connect Hub</p>
                  <p className="text-xl font-bold text-slate-900">Knowledge City, Hyderabad, India</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
               <p className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Follow Prep Pulse</p>
               <div className="flex gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer"></div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="relative">
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
             <div className="glass-premium p-10 md:p-16 bg-white border-slate-100 shadow-xl relative z-10">
               {!submitted ? (
                 <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                       <input type="text" required placeholder="John Doe" className="w-full" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                       <input type="email" required placeholder="john@example.com" className="w-full" />
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                     <select className="w-full">
                       <option>General Inquiry</option>
                       <option>Technical Support</option>
                       <option>Career Guidance</option>
                       <option>Corporate Partnership</option>
                     </select>
                   </div>

                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Message</label>
                     <textarea required placeholder="How can we help you?" className="w-full h-40" />
                   </div>

                   <button disabled={loading} className="w-full btn-premium py-5 group shadow-indigo-500/20">
                     {loading ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                       <>
                         <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                         <span className="text-xs font-black uppercase tracking-widest">Transmit Message</span>
                       </>
                     )}
                   </button>
                 </form>
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center py-12 space-y-8"
                 >
                   <div className="w-24 h-24 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Message Received</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">
                       Our preparation advisors will review your submission and respond within 24 hours.
                     </p>
                   </div>
                   <button onClick={() => setSubmitted(false)} className="px-12 py-5 bg-slate-50 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">
                      Send another message
                   </button>
                 </motion.div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
