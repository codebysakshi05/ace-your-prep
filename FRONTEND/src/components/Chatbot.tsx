import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Terminal, ChevronRight, Zap, Brain, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { databaseService } from '../services/databaseService';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export function Chatbot() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'terminal' | 'chat'>('terminal');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState<{title: string, value: number}[]>([]);

  useEffect(() => {
    if (isOpen && profile?.id) {
      databaseService.fetchUserStats(profile.id).then(userStats => {
        setStats([
          { title: 'Aptitude', value: userStats.aptitude || 0 },
          { title: 'GD Skills', value: userStats.gd || 0 },
          { title: 'Comm Skills', value: userStats.communication || 0 },
          { title: 'Interviews', value: userStats.interview || 0 },
        ]);
      });
    }
  }, [isOpen, profile?.id]);

  // Initial Greeting
  useEffect(() => {
    const greeting = `Greetings, ${profile?.full_name?.split(' ')[0] || 'Student'}. AI Mentor initialized. I have analyzed your current status. How shall we optimize your path to elite placement today?`;
    setMessages(prev => {
      if (prev.length > 1) return prev;
      return [{ 
        id: '1', 
        sender: 'bot', 
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
    });
  }, [profile?.full_name]);

  // Global Event Listener for AI Hand-off
  useEffect(() => {
    const handleMentorDeepDive = (event: any) => {
      const { message } = event.detail;
      setIsOpen(true);
      setView('chat');
      
      const mentorMessage: ChatMessage = { 
        id: `m-${Date.now()}`, 
        sender: 'user', 
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, mentorMessage]);
      
      setIsTyping(true);
      setTimeout(() => {
        const reply = "Analyzing AI telemetry... Based on your high failure rate in Logic Archetypes, I have initialized a focused recovery session. Shall we begin the reconstruction?";
        setMessages(prev => [...prev, { 
          id: `b-${Date.now()}`, 
          sender: 'bot', 
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1500);
    };

    window.addEventListener('open-chatbot', handleMentorDeepDive);
    return () => window.removeEventListener('open-chatbot', handleMentorDeepDive);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (isOpen && view === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, view]);



  const processResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('cost')) return "The Ace It Up AI Mentor is currently open-access. Premium enterprise modules are in synchronization.";
    if (lower.includes('interview')) return "The AI Interviewer is active. It uses behavioral heuristic models to evaluate your performance. Would you like me to load a mock behavioral interview simulation?";
    if (lower.includes('aptitude')) return "Aptitude clusters are critical. Your dashboard shows your speed-to-accuracy ratio is the primary bottleneck. Focus on Quantitative reasoning sprints to improve.";
    if (lower.includes('status') || lower.includes('profile') || lower.includes('stats')) return `Current Rank: ${profile?.level || 1}. Status: ${profile?.xp && profile.xp > 500 ? 'DOMINANT' : 'OPTIMIZING'}. You have accumulated ${profile?.xp || 0} XP. Access your Dashboard for a full AI audit.`;
    if (lower.includes('tip')) return "AI Tip: Use the STAR method (Situation, Task, Action, Result) when answering behavioral questions. It structures your thoughts and ensures you cover all key metrics the interviewer is looking for.";
    return "Query processed. I recommend engaging with the Masterclass Hub or completing an Aptitude cycle to stabilize your index. Can I assist you with anything specific?";
  };

  const sendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReplyText = processResponse(userMessage.text);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickReplies = [
    "Show me my stats",
    "Give me an interview tip",
    "How do I improve Aptitude?"
  ];

  const renderSynapses = () => {
    if (!stats.length) return null;
    const activeStats = stats.filter(s => s.value > 0);
    const avgScore = activeStats.length
      ? activeStats.reduce((acc, curr) => acc + curr.value, 0) / activeStats.length
      : 0;
    
    let firstCard;
    if (avgScore === 0) {
      firstCard = {
        title: "Start Practicing",
        desc: "You haven't completed any sessions yet. Start with Aptitude to set your baseline.",
        priority: "ACTION REQUIRED",
        bg: "bg-indigo-50 dark:bg-indigo-500/10",
        iconBg: "bg-indigo-500",
        badgeBg: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
        path: "/aptitude"
      };
    } else {
      const sorted = [...activeStats].sort((a, b) => a.value - b.value);
      const weakest = sorted[0] || [...stats].sort((a, b) => a.value - b.value)[0];
      
      let priorityText = 'LOW PRIORITY';
      let theme = 'indigo';
      
      if (weakest.value < 50) {
        priorityText = 'HIGH PRIORITY';
        theme = 'rose';
      } else if (weakest.value < 75) {
        priorityText = 'MEDIUM PRIORITY';
        theme = 'amber';
      } else {
        priorityText = 'OPTIMIZED';
        theme = 'emerald';
      }

      firstCard = {
        title: `Boost ${weakest.title}`,
        desc: `Your ${weakest.title} capability is currently at ${weakest.value}%. ${weakest.value < 75 ? 'We recommend a focused sprint.' : 'Keep maintaining this edge.'}`,
        priority: priorityText,
        bg: `bg-${theme}-50 dark:bg-${theme}-500/10`,
        iconBg: `bg-${theme}-500`,
        badgeBg: `bg-${theme}-100 dark:bg-${theme}-500/20 text-${theme}-600 dark:text-${theme}-400`,
        path: weakest.title === 'Aptitude' ? '/aptitude' : weakest.title === 'GD Skills' ? '/gd-practice' : weakest.title === 'Interviews' ? '/interview' : '/communication'
      };
    }

    // Create second card based on rank progression
    const currentLvl = profile?.level || 1;
    const nextRank = currentLvl >= 10 ? 'Elite' : currentLvl >= 5 ? 'Pro' : 'Candidate';
    const nextTrack = currentLvl >= 10 ? 'Master track' : currentLvl >= 5 ? 'Elite track' : 'Pro track';
    const progress = Math.min(100, Math.round(((profile?.xp || 0) % 500) / 500 * 100));
    
    const secondCard = {
      title: "Roadmap Progress",
      desc: `You are ${progress}% through the ${nextRank} rank. Complete one more challenge to unlock the ${nextTrack}.`,
      priority: 'LOW PRIORITY',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconBg: 'bg-indigo-500', 
      badgeBg: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      path: '/roadmap'
    };

    return (
      <div className="space-y-4">
        {[firstCard, secondCard].map((card, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border border-border shadow-sm bg-white dark:bg-slate-900/50 hover:-translate-y-1 transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-md`}>
                <Zap className="w-5 h-5" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${card.badgeBg}`}>
                {card.priority}
              </span>
            </div>
            <h4 className="text-lg font-black text-headingText mb-2">{card.title}</h4>
            <p className="text-sm text-mutedText font-medium leading-relaxed mb-6">
              {card.desc}
            </p>
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate(card.path);
              }}
              className="w-full py-3 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors border-t border-border"
            >
              Execute Node <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-10 right-10 z-50 p-6 bg-indigo-600 rounded-[2rem] shadow-[0_30px_60px_rgba(99,102,241,0.5)] text-white transition-all transform hover:scale-110 active:scale-95 group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 animate-float'}`}
      >
        <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
           <span className="text-[9px] font-black text-white leading-none">2</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90]"
            />
            
            <motion.div 
              initial={{ opacity: 0, x: 450 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 450 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 z-[100] w-full sm:w-[450px] bg-surface flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="p-6 bg-indigo-600 border-b border-indigo-700 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4 text-white">
                  {view === 'chat' && (
                    <button onClick={() => setView('terminal')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white italic tracking-widest uppercase">AI Mentor Terminal</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></div>
                      <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">Synced Logic V3.0</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {view === 'terminal' ? (
                <>
                  <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
                    <h4 className="text-[10px] font-black text-mutedText uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                      Critical Synapses
                    </h4>
                    {renderSynapses()}
                  </div>
                  <div className="p-6 bg-surface border-t border-border shrink-0">
                    <button 
                      onClick={() => setView('chat')}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/20"
                    >
                      <MessageCircle className="w-5 h-5" /> Start AI Inquiry
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Chat Area */}
                  <div className="flex-grow p-6 overflow-y-auto space-y-8 bg-surface custom-scrollbar">
                    {messages.map((msg) => (
                      <motion.div 
                        initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${
                            msg.sender === 'user' 
                              ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/20' 
                              : 'bg-slate-100 dark:bg-white/5 border border-border text-slate-800 dark:text-slate-200 rounded-tl-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <p className="text-[9px] font-black text-mutedText uppercase tracking-widest px-2">{msg.timestamp} • {msg.sender === 'user' ? 'Manual Link' : 'AI Feed'}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-white/5 border border-border p-4 rounded-2xl flex gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} className="h-1" />
                  </div>

                  {/* Input Wrapper */}
                  <div className="p-6 bg-surface border-t border-border shrink-0">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-4 mb-2 -mx-6 px-6">
                      {quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(qr)}
                          className="whitespace-nowrap px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={handleSend} className="relative">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your AI Mentor..." 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-6 pr-16 py-4 text-sm text-headingText focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-mutedText"
                      />
                      <button 
                        type="submit" 
                        disabled={!input.trim() || isTyping} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 disabled:opacity-30 text-white p-3 rounded-xl transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                    <div className="flex justify-between items-center mt-4 px-2">
                       <p className="text-[9px] text-mutedText font-black uppercase tracking-[0.3em]">AI Protocol: Active</p>
                       <Sparkles className="w-3 h-3 text-indigo-500/40" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
