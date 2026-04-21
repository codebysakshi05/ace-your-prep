import { useState, useEffect } from 'react';
import { 
  Database, Plus, Search, Edit, Trash2, 
  Brain, Video, MessageSquare, X, Save, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function AdminQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    module_type: 'aptitude',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    category: '',
    difficulty: 'Medium',
    explanation: '',
    keywords: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase.from('module_questions').select('*').order('created_at', { ascending: false });
    if (data) setQuestions(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      module_type: 'aptitude',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      category: '',
      difficulty: 'Medium',
      explanation: '',
      keywords: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (question: any) => {
    setFormData({
      module_type: question.module_type,
      question_text: question.question_text,
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer || '',
      category: question.category || '',
      difficulty: question.difficulty || 'Medium',
      explanation: question.explanation || '',
      keywords: Array.isArray(question.keywords) ? question.keywords.join(', ') : ''
    });
    setEditingId(question.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      options: formData.module_type === 'aptitude' ? formData.options : null
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('module_questions').update(payload).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('module_questions').insert([payload]);
      error = err;
    }
    
    if (!error) {
      toast.success(editingId ? 'Intelligence fragment updated!' : 'New unit deployed to matrix!', {
        icon: editingId ? '📝' : '🚀',
        style: { background: '#0f172a', color: '#fff', border: '1px solid #4f46e5' }
      });
      resetForm();
      fetchQuestions();
    } else {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-4">
          <p className="font-bold text-white text-sm uppercase tracking-tight">Confirm termination of protocol unit?</p>
          <div className="flex gap-2">
            <button 
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg font-black text-[10px] uppercase"
            >
              Verify Delete
            </button>
            <button 
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-black text-[10px] uppercase"
            >
              Abort
            </button>
          </div>
        </div>
      ), { duration: 5000, position: 'bottom-center' });
    });

    if (isConfirmed) {
      const { error } = await supabase.from('module_questions').delete().eq('id', id);
      if (!error) {
        toast.success('Unit purged from intelligence bank.');
        fetchQuestions();
      }
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.module_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch(type) {
      case 'aptitude': return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'interview': return <Video className="w-4 h-4 text-rose-500" />;
      case 'communication': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12 px-4">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-50 rounded-3xl border border-indigo-200 shadow-sm">
            <Database className="w-10 h-10 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Content Matrix</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Assessment Infrastructure & Deployment</p>
          </div>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_15px_40px_-5px_rgba(99,102,241,0.5)] active:scale-95 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" /> Deploy New Unit
        </button>
      </div>

      {/* Search & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search across global question clusters..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2rem] py-5 pl-16 pr-8 text-slate-900 focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-slate-300"
          />
        </div>
        <div className="lg:col-span-3 glass-card px-8 flex items-center justify-between">
           <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Live Bank</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{filteredQuestions.length}</p>
           </div>
           <Filter className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      {/* Add/Edit Question Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white border border-slate-200 w-full max-w-3xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] relative z-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                     {editingId ? <Edit className="w-8 h-8 text-amber-500" /> : <Plus className="w-8 h-8 text-primary" />} 
                     {editingId ? 'Modify Cluster' : 'Protocol Unit'}
                   </h2>
                   <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1 px-1">
                     {editingId ? 'Adjusting parameters for ID: ' + editingId.substring(0, 8) : 'Define assessment parameters'}
                   </p>
                </div>
                <button onClick={resetForm} className="p-3 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">Target Stream</label>
                    <select 
                      value={formData.module_type}
                      onChange={(e) => setFormData({...formData, module_type: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary transition-all font-bold"
                    >
                      <option value="aptitude">Aptitude Engine</option>
                      <option value="interview">Interview Simulator</option>
                      <option value="communication">Speech Logic (GD/Comm)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">Difficulty Tier</label>
                    <select 
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary transition-all font-bold"
                    >
                      <option value="Beginner">Beginner (Tier 3)</option>
                      <option value="Intermediate">Intermediate (Tier 2)</option>
                      <option value="Expert">Advanced (Tier 1)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">Category Identifier</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Logical Reasoning, Behavioral Tech"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary transition-all font-bold placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">Primary Content Fragment</label>
                  <textarea 
                    required
                    placeholder="Describe the assessment challenge..."
                    value={formData.question_text}
                    onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 text-slate-900 focus:outline-none focus:border-primary min-h-[120px] transition-all font-medium resize-none"
                  />
                </div>

                {formData.module_type === 'aptitude' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">Response Options</label>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                           <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0 border border-indigo-100">{String.fromCharCode(65 + i)}</div>
                           <input 
                            type="text"
                            required
                            placeholder={`Vector ${i + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOps = [...formData.options];
                              newOps[i] = e.target.value;
                              setFormData({...formData, options: newOps});
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">
                    {formData.module_type === 'aptitude' ? 'Key Solution (Exact Option Text)' : 'Validation Keywords (comma separated)'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.module_type === 'aptitude' ? formData.correct_answer : formData.keywords}
                    onChange={(e) => setFormData({...formData, [formData.module_type === 'aptitude' ? 'correct_answer' : 'keywords']: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary transition-all font-black text-sm"
                  />
                </div>

                <div className="pt-8">
                  <button type="submit" className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 transition-all shadow-lg hover:-translate-y-1 
                    ${editingId ? 'bg-amber-500 shadow-amber-200 text-white' : 'bg-gradient-to-r from-indigo-600 to-primary text-white shadow-indigo-200'}
                  `}>
                    <Save className="w-5 h-5" /> {editingId ? 'Push Adjustments' : 'Commit to Intelligence Bank'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Data Table */}
      <div className="glass-card overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-10 py-6">Stream</th>
                <th className="px-10 py-6">Intelligence Category</th>
                <th className="px-10 py-6">Fragment Preview</th>
                <th className="px-10 py-6">Tier</th>
                <th className="px-10 py-6 text-right pr-12">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs">Scanning Node Clusters...</td></tr>
              ) : filteredQuestions.map((q, i) => (
                <motion.tr 
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50 transition-all group"
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 group-hover:border-primary/30 transition-all">
                          {getIcon(q.module_type)}
                       </div>
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{q.module_type}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl inline-block border border-indigo-100 group-hover:border-indigo-200 transition-all">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{q.category}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-[280px]">"{q.question_text}"</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border
                      ${q.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                        q.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}
                    `}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right pr-12">
                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEdit(q)}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredQuestions.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                       <Database className="w-16 h-16 mb-6 text-slate-400" />
                       <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Zero Fragments Filtered</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
