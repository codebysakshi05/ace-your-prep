import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FileText, Download, User, Briefcase, GraduationCap, 
  Plus, Trash2, CheckCircle, RefreshCcw, 
  ShieldCheck, Layout, Sparkles, Target, Award,
  Zap, ArrowRight, Brain
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ResumeBuilder() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('classic');
  const [resumeData, setResumeData] = useState<any>({
    personal: { full_name: profile?.full_name || '', email: user?.email || '', phone: '', location: '', objective: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [] // Verified achievements from Ace It Up
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSavedResume();
  }, [user]);

  const fetchSavedResume = async () => {
    if (!user) return;
    const { data } = await supabase.from('resumes').select('*').eq('user_id', user.id).single();
    if (data) setResumeData(data.content);
  };

  const saveResume = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from('resumes').upsert({
      user_id: user.id,
      content: resumeData,
      last_updated: new Date().toISOString()
    });
    if (!error) toast.success("Draft archived in neural cloud!", { icon: '🧠' });
    setIsSaving(false);
  };

  const syncPerformanceAchievements = async () => {
    setIsSyncing(true);
    try {
      const [aptRes, intRes, commRes] = await Promise.all([
        supabase.from('aptitude_scores').select('score, topic').eq('user_id', user?.id),
        supabase.from('interview_scores').select('evaluation_score, question_category').eq('user_id', user?.id),
        supabase.from('communication_scores').select('overall_score, prompt').eq('user_id', user?.id)
      ]);

      const verifiedAchievements: string[] = [];
      const newSkills: string[] = [];

      // Logic for Aptitude
      if (aptRes.data && aptRes.data.length > 0) {
        const top = [...aptRes.data].sort((a, b) => b.score - a.score)[0];
        if (top.score >= 80) {
          verifiedAchievements.push(`Top-tier Mastery: ${top.topic} (${top.score}%)`);
          newSkills.push(top.topic, 'Analytical Reasoning');
        }
      }

      // Logic for Interview
      if (intRes.data && intRes.data.length > 0) {
        const avg = intRes.data.reduce((a, c) => a + c.evaluation_score, 0) / intRes.data.length;
        if (avg >= 75) {
          verifiedAchievements.push(`Verified Professional Communicator (STAR Method)`);
          newSkills.push('STAR Communication', 'Executive Articulation');
        }
      }

      // Logic for Communication
      if (commRes.data && commRes.data.length > 0) {
        const avg = commRes.data.reduce((a: number, c: any) => a + (c.overall_score || 0), 0) / commRes.data.length;
        if (avg >= 70) {
          verifiedAchievements.push(`Strong Interpersonal Presence (Verified)`);
          newSkills.push('Verbal Clarity', 'Conflict Resolution');
        }
      }

      setResumeData((prev: any) => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...newSkills])),
        achievements: Array.from(new Set([...(prev.achievements || []), ...verifiedAchievements]))
      }));

      toast.success('Performance matrix synchronized!', {
        icon: '🔗',
        style: { background: '#0f172a', color: '#fff', border: '1px solid #4f46e5' }
      });
    } catch (err) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    setIsSaving(true);
    toast.loading('Encoding professional document...', { id: 'pdf-gen' });
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: template === 'neon' ? '#020617' : '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile?.full_name || 'My'}_Profile_Architect.pdf`);
      toast.success('Document Exported Successfully!', { id: 'pdf-gen', icon: '💎' });
    } catch (err) {
      toast.error('Export error. Please refresh.', { id: 'pdf-gen' });
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (section: string) => {
    setResumeData((prev: any) => ({
      ...prev,
      [section]: [...(prev[section] || []), { id: Date.now(), title: '', desc: '', date: '', location: '' }]
    }));
  };

  const removeItem = (section: string, id: number) => {
    setResumeData((prev: any) => ({
      ...prev,
      [section]: prev[section].filter((item: any) => item.id !== id)
    }));
  };

  const updateItem = (section: string, id: number, field: string, value: string) => {
    setResumeData((prev: any) => ({
      ...prev,
      [section]: prev[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const [optimizationScore, setOptimizationScore] = useState(0);
  const [optimizationTips, setOptimizationTips] = useState<string[]>([]);

  useEffect(() => {
    runOptimizationAudit();
  }, [resumeData]);

  const runOptimizationAudit = () => {
    let score = 0;
    const tips = [];
    
    if (resumeData.personal.objective.length > 100) score += 15;
    else tips.push("Expand objective vector.");

    if (resumeData.experience.length >= 2) score += 20;
    else tips.push("Add more career milestones.");

    const actionVerbs = ['managed', 'engineered', 'developed', 'coordinated', 'led', 'architected', 'optimized', 'achieved', 'delivered'];
    const text = JSON.stringify(resumeData).toLowerCase();
    const verbCount = actionVerbs.filter(v => text.includes(v)).length;
    score += Math.min(25, verbCount * 5);
    if (verbCount < 3) tips.push("Use impact action verbs.");

    if (resumeData.achievements?.length > 0) score += 30;
    else tips.push("Neural Sync achievements.");

    if (resumeData.personal.phone && resumeData.personal.location) score += 10;

    setOptimizationScore(Math.min(100, score));
    setOptimizationTips(tips.slice(0, 3));
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in space-y-12 pb-20 px-4 md:px-8">
      {/* 🔮 Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <FileText className="w-10 h-10 text-primary" />
             </div>
             <div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Profile Architect</h1>
                <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.4em] mt-2">Verified AI Resume Engine v2.0</p>
             </div>
          </div>
          <p className="text-indigo-300/60 text-lg font-medium max-w-2xl">
            Engineer a high-authority professional document synced with your actual <span className="text-white">Neural Proficiency</span> scores.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-5">
           <button onClick={saveResume} disabled={isSaving} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] border border-white/10 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl active:scale-95">
             {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-indigo-400" />} {isSaving ? 'Synching...' : 'Neural Archive'}
           </button>
           <button onClick={downloadPDF} className="btn-premium px-10 py-5 shadow-indigo-500/40">
             <Download className="w-5 h-5" /> Export Intelligence
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* 🛠️ Constructor Panel */}
        <div className="xl:col-span-7 space-y-10">
           {/* Navigation Nodes */}
            <div className="bg-slate-950/40 p-5 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl sticky top-8 z-40 flex flex-col md:flex-row gap-6">
               <div className="flex justify-between items-center flex-grow">
                  {[
                    { id: 1, icon: User, label: 'Core' },
                    { id: 2, icon: Briefcase, label: 'History' },
                    { id: 3, icon: Brain, label: 'Intelligence' },
                    { id: 4, icon: Layout, label: 'Design' }
                  ].map(node => (
                    <button 
                      key={node.id} 
                      onClick={() => setStep(node.id)}
                      className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${step === node.id ? 'bg-primary text-white shadow-2xl shadow-primary/40' : 'text-indigo-400/40 hover:text-indigo-300 hover:bg-white/5'}`}
                    >
                      <node.icon className={`w-5 h-5 ${step === node.id ? 'animate-float' : ''}`} />
                      <span className={step === node.id ? 'block' : 'hidden md:block'}>{node.label}</span>
                    </button>
                  ))}
               </div>
               
               <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-[1.5rem] border border-white/10">
                  <div className="text-right">
                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Opt. Score</p>
                     <p className={`text-lg font-black tabular-nums leading-none ${optimizationScore > 80 ? 'text-emerald-400' : optimizationScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {optimizationScore}%
                     </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                        <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - optimizationScore} className={optimizationScore > 80 ? 'text-emerald-500' : 'text-indigo-500'} />
                     </svg>
                  </div>
               </div>
            </div>

            {optimizationTips.length > 0 && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-3xl flex items-start gap-4">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                  <div>
                     <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Neural Optimization Tips</p>
                     <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {optimizationTips.map((tip, i) => (
                           <span key={i} className="text-xs font-medium text-indigo-200/60 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> {tip}
                           </span>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}

           <motion.div 
             key={step}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-card p-10 md:p-14 space-y-10 min-h-[600px]"
           >
              {step === 1 && (
                <div className="space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Core Identity</h2>
                      <div className="h-px flex-grow bg-white/5"></div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Full Name', field: 'full_name', icon: User },
                        { label: 'Email Address', field: 'email', icon: Award },
                        { label: 'Primary Contact', field: 'phone', icon: Zap },
                        { label: 'Location Node', field: 'location', icon: Target }
                      ].map(input => (
                        <div key={input.field} className="space-y-3">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                             <input.icon className="w-3 h-3" /> {input.label}
                           </label>
                           <input 
                             value={resumeData.personal[input.field]} 
                             onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, [input.field]: e.target.value}})} 
                             className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-semibold" 
                           />
                        </div>
                      ))}
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Professional Vector (Objective)</label>
                      <textarea 
                        value={resumeData.personal.objective} 
                        onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, objective: e.target.value}})} 
                        className="w-full bg-slate-950/60 border border-white/10 rounded-[2rem] p-8 text-white h-40 focus:outline-none focus:border-primary transition-all font-medium resize-none text-lg leading-relaxed" 
                        placeholder="Define your career trajectory..."
                      />
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10">
                   <div className="flex justify-between items-center gap-10">
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Experience Node</h2>
                      <div className="flex gap-4">
                         <button onClick={() => addItem('experience')} className="p-4 bg-indigo-600/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all border border-indigo-500/10"><Briefcase className="w-5 h-5" /></button>
                         <button onClick={() => addItem('education')} className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"><GraduationCap className="w-5 h-5" /></button>
                      </div>
                   </div>
                   
                   <div className="space-y-8">
                      {resumeData.experience.map((item: any) => (
                        <motion.div layout key={item.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6 group hover:border-primary/30 transition-all shadow-inner">
                           <div className="flex justify-between items-start gap-6">
                              <div className="flex-grow space-y-2">
                                <input placeholder="Architecture / Organization" value={item.title} onChange={(e) => updateItem('experience', item.id, 'title', e.target.value)} className="bg-transparent text-2xl font-black text-white focus:outline-none w-full tracking-tight" />
                                <input placeholder="Cycle (e.g. 2021 - Present)" value={item.date} onChange={(e) => updateItem('experience', item.id, 'date', e.target.value)} className="bg-transparent text-[10px] font-black text-indigo-400 uppercase tracking-widest focus:outline-none w-full" />
                              </div>
                              <button onClick={() => removeItem('experience', item.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                           </div>
                           <textarea placeholder="Key mission results and algorithmic impact..." value={item.desc} onChange={(e) => updateItem('experience', item.id, 'desc', e.target.value)} className="bg-transparent text-indigo-100/70 focus:outline-none w-full h-32 resize-none leading-relaxed font-medium" />
                        </motion.div>
                      ))}
                      {resumeData.experience.length === 0 && <p className="text-center py-20 text-indigo-300/10 font-black uppercase tracking-[0.5em] text-xs">No Experience records detected</p>}
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12 text-center py-10">
                   <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-primary/20 shadow-2xl relative">
                      <Brain className="w-16 h-16 text-primary animate-pulse" />
                      <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full"></div>
                   </div>
                   
                   <div className="max-w-md mx-auto space-y-4">
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Artificial Sync</h2>
                      <p className="text-indigo-300/50 font-medium">Inject your verified platform achievements directly into your profile matrices.</p>
                   </div>
                   
                   <button 
                    onClick={syncPerformanceAchievements} 
                    disabled={isSyncing}
                    className="w-full max-w-lg mx-auto py-7 bg-white text-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all active:scale-95 group"
                   >
                     {isSyncing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> } 
                     {isSyncing ? 'Accessing Neural Logs...' : 'Synchronize Verified Data'}
                   </button>

                   <div className="space-y-10 pt-10 border-t border-white/5">
                      <div className="space-y-5">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 justify-center">
                            <ShieldCheck className="w-4 h-4" /> Verified Skill Tags
                         </h4>
                         <div className="flex flex-wrap gap-4 justify-center">
                            {resumeData.skills.map((skill: string) => (
                              <motion.div layout key={skill} className="bg-indigo-600/10 px-6 py-3 rounded-2xl border border-indigo-500/20 text-white font-black text-[10px] tracking-widest uppercase flex items-center gap-3">
                                <span>{skill}</span>
                                <button onClick={() => setResumeData({...resumeData, skills: resumeData.skills.filter((s: string) => s !== skill)})} className="text-indigo-400 hover:text-rose-500"><Plus className="w-3 h-3 rotate-45" /></button>
                              </motion.div>
                            ))}
                            <button onClick={() => {const s = prompt("Enter custom skill:"); if (s) setResumeData({...resumeData, skills: [...resumeData.skills, s]});}} className="px-6 py-3 border-2 border-dashed border-white/10 rounded-2xl text-white/30 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-white transition-all">+ Add Entry</button>
                         </div>
                      </div>

                      <div className="space-y-5">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 justify-center">
                            <Award className="w-4 h-4" /> Platform Achievements
                         </h4>
                         <div className="flex flex-col gap-3 max-w-xl mx-auto">
                            {(resumeData.achievements || []).map((ach: string, i: number) => (
                              <div key={i} className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-left">
                                 <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                 <span className="text-xs font-bold text-emerald-100">{ach}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}
              
              {step === 4 && (
                <div className="space-y-10">
                   <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Design Protocol</h1>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div onClick={() => setTemplate('classic')} className={`cursor-pointer bg-white/5 p-10 rounded-[2.5rem] border transition-all relative group shadow-2xl ${template === 'classic' ? 'border-primary ring-4 ring-primary/10' : 'border-white/10 hover:border-white/30'}`}>
                         {template === 'classic' && <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl"><CheckCircle className="w-6 h-6" /></div>}
                         <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-800 mb-8"><Layout className="w-8 h-8" /></div>
                         <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Executive Minimal</h4>
                         <p className="text-sm text-indigo-200/40 leading-relaxed">High readability for Human Resources and ATS algorithms. Clean, fast, effective.</p>
                      </div>
                      <div onClick={() => setTemplate('neon')} className={`cursor-pointer bg-slate-950 p-10 rounded-[2.5rem] border transition-all relative group shadow-2xl ${template === 'neon' ? 'border-cyan-400 ring-4 ring-cyan-400/10' : 'border-white/5 hover:border-white/10 opacity-60'}`}>
                         {template === 'neon' && <div className="absolute -top-4 -right-4 w-10 h-10 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl"><CheckCircle className="w-6 h-6" /></div>}
                         <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-8"><Zap className="w-8 h-8" /></div>
                         <h4 className="text-xl font-black text-cyan-400 mb-2 uppercase tracking-tight text-glow">Neon Protocol</h4>
                         <p className="text-sm text-cyan-400/30 leading-relaxed italic">The future of technical resumes. Striking dark mode layout with custom cyan highlights.</p>
                      </div>
                   </div>
                </div>
              )}
           </motion.div>
        </div>

        {/* 🎨 Hyper-Render Preview (Static for export-safe CSS) */}
        <div className="xl:col-span-5 relative">
           <div className="sticky top-10 space-y-6">
              <div className="flex items-center justify-between px-3">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Hydratable Render Active</span>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/20 transition-all text-white"><ArrowRight className="w-4 h-4 rotate-180" /></button>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/20 transition-all text-white"><ArrowRight className="w-4 h-4" /></button>
                 </div>
              </div>

              <div id="resume-preview" className={`w-full min-h-[850px] rounded-[2rem] shadow-[0_60px_100px_-30px_rgba(0,0,0,0.8)] overflow-hidden origin-top transition-all duration-700 ${template === 'neon' ? 'bg-[#020617] text-white' : 'bg-white text-slate-900'} p-12 md:p-16 border border-white/5`}>
                 <header className={`pb-10 mb-10 border-b-2 ${template === 'neon' ? 'border-cyan-400/30' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start">
                       <div>
                          <h1 className={`text-5xl font-black uppercase tracking-tighter mb-4 ${template === 'neon' ? 'text-glow text-cyan-400' : 'text-slate-900'}`}>{resumeData.personal.full_name || 'IDENT_UNKWN'}</h1>
                          <div className={`flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest ${template === 'neon' ? 'text-cyan-400/60' : 'text-slate-500'}`}>
                             <span>{resumeData.personal.email || 'neuro-link@ready'}</span>
                             <span>{resumeData.personal.phone}</span>
                             <span>{resumeData.personal.location}</span>
                          </div>
                       </div>
                       <div className={`shrink-0 p-5 rounded-3xl border ${template === 'neon' ? 'bg-cyan-400/5 border-cyan-400/30' : 'bg-slate-50 border-slate-100'}`}>
                          <ShieldCheck className={`w-10 h-10 ${template === 'neon' ? 'text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]' : 'text-indigo-600'}`} />
                       </div>
                    </div>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                   <div className="md:col-span-8 space-y-12">
                      <section className="space-y-4">
                         <h2 className={`text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 ${template === 'neon' ? 'text-cyan-400' : 'text-indigo-600'}`}>
                           <Zap className="w-4 h-4" /> Core Mission
                         </h2>
                         <p className={`text-sm leading-relaxed font-medium ${template === 'neon' ? 'text-white/80' : 'text-slate-600'}`}>
                           {resumeData.personal.objective || 'Architecting professional excellence...'}
                         </p>
                      </section>

                      <section className="space-y-8">
                         <h2 className={`text-xs font-black uppercase tracking-[0.3em] border-b-2 pb-3 ${template === 'neon' ? 'text-cyan-400 border-cyan-400/20' : 'text-indigo-600 border-slate-100'}`}>
                           Experience Matrix
                         </h2>
                         {resumeData.experience.map((ex: any) => (
                           <div key={ex.id} className="space-y-2 group">
                              <div className="flex justify-between items-baseline">
                                 <h3 className={`text-base font-black uppercase tracking-tight ${template === 'neon' ? 'text-white' : 'text-slate-900'}`}>{ex.title || 'Role Name'}</h3>
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${template === 'neon' ? 'text-cyan-400/40' : 'text-slate-400'}`}>{ex.date}</span>
                              </div>
                              <p className={`text-xs leading-relaxed font-medium ${template === 'neon' ? 'text-white/60' : 'text-slate-600'}`}>{ex.desc}</p>
                           </div>
                         ))}
                      </section>
                   </div>

                   <div className="md:col-span-4 space-y-12">
                      <section className="space-y-5">
                         <h2 className={`text-xs font-black uppercase tracking-[0.3em] ${template === 'neon' ? 'text-cyan-400' : 'text-indigo-600'}`}>Skills</h2>
                         <div className="flex flex-wrap gap-2">
                           {resumeData.skills.map((s: string) => (
                             <span key={s} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${template === 'neon' ? 'bg-cyan-400/5 text-cyan-400 border border-cyan-400/20' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                               {s}
                             </span>
                           ))}
                         </div>
                      </section>

                      {resumeData.achievements?.length > 0 && (
                        <section className="space-y-5">
                           <h2 className={`text-xs font-black uppercase tracking-[0.3em] ${template === 'neon' ? 'text-cyan-400' : 'text-indigo-600'}`}>Verified</h2>
                           <div className="space-y-3">
                             {resumeData.achievements.map((ach: string, i: number) => (
                               <div key={i} className={`p-3 rounded-xl border text-[9px] font-bold leading-tight ${template === 'neon' ? 'bg-white/5 border-white/5 text-white/50' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                                 {ach}
                               </div>
                             ))}
                           </div>
                        </section>
                      )}

                      <div className={`p-6 rounded-3xl border text-center space-y-2 mt-8 animate-pulse ${template === 'neon' ? 'bg-cyan-400/5 border-cyan-400/10' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 border-transparent'}`}>
                         <ShieldCheck className={`w-6 h-6 mx-auto ${template === 'neon' ? 'text-cyan-400' : 'text-white'}`} />
                         <p className="text-[10px] font-black uppercase tracking-widest leading-none">Global Rank Peak</p>
                         <p className={`text-2xl font-black ${template === 'neon' ? 'text-cyan-400' : 'text-white'}`}>TOP 5%</p>
                      </div>
                   </div>
                 </div>

                 <footer className={`mt-20 pt-10 border-t flex justify-between items-center ${template === 'neon' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="space-y-1">
                       <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${template === 'neon' ? 'text-white' : 'text-slate-900'}`}>Verified by ACE IT UP</p>
                       <p className={`text-[8px] font-bold uppercase tracking-widest ${template === 'neon' ? 'text-white/20' : 'text-slate-400'}`}>Platform Validation ID: {user?.id.slice(0, 12)}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${template === 'neon' ? 'bg-white/5 text-white/30' : 'bg-slate-900 text-white'}`}>v2.0 Elite</div>
                 </footer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
