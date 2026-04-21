import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export function Chatbot() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    const greeting = `Greetings, ${profile?.full_name?.split(' ')[0] || 'Target'}. Neural link established. I have analyzed your current status clusters. How shall we optimize your path to elite placement today?`;
    setMessages([{ 
      id: '1', 
      sender: 'bot', 
      text: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, [profile]);

  // Global Event Listener for Neural Hand-off
  useEffect(() => {
    const handleMentorDeepDive = (event: any) => {
      const { message } = event.detail;
      setIsOpen(true);
      
      const mentorMessage: ChatMessage = { 
        id: `m-${Date.now()}`, 
        sender: 'user', 
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, mentorMessage]);
      
      setIsTyping(true);
      setTimeout(() => {
        const reply = "Intercepting Mentor telemetry... Based on your high failure rate in Logic Archetypes, I have initialized a focused recovery session. Shall we begin the reconstruction?";
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
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const processResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('cost')) return "The Ace It Up neural core is currently open-access. Premium enterprise modules are in synchronization.";
    if (lower.includes('interview')) return "The Neural Interviewer is active. It uses behavioral heuristic models to evaluate your performance. Ready to simulate?";
    if (lower.includes('aptitude')) return "Aptitude clusters are critical. Your dashboard shows your speed-to-accuracy ratio is the primary bottleneck.";
    if (lower.includes('status') || lower.includes('profile')) return `Current Rank: ${profile?.level || 1}. Status: ${profile?.xp && profile.xp > 500 ? 'DOMINANT' : 'OPTIMIZING'}. Access your Dashboard for a full neural audit.`;
    return "Query processed. I recommend engaging with the Masterclass Hub or completing an Aptitude cycle to stabilize your index.";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: input,
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-10 right-10 z-50 p-6 bg-indigo-600 rounded-[2rem] shadow-[0_30px_60px_rgba(99,102,241,0.5)] text-white transition-all transform hover:scale-110 active:scale-95 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-float'}`}
      >
        <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-4 border-slate-950"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
            className="fixed bottom-10 right-10 z-50 w-80 sm:w-[450px] h-[700px] max-h-[85vh] glass-card flex flex-col overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] origin-bottom-right"
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-slate-950 to-indigo-900/20 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <Terminal className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white italic tracking-widest uppercase">Neural Core v2.0</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Synced</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-8 overflow-y-auto space-y-8 bg-slate-950/20 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-xl shadow-indigo-500/20' 
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-xl'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">{msg.timestamp} • {msg.sender === 'user' ? 'Manual Link' : 'Neural Feed'}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input Wrapper */}
            <div className="p-8 bg-slate-950/40 border-t border-white/5 backdrop-blur-3xl">
              <form onSubmit={handleSend} className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inquire the Intelligence Core..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-20 py-5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 disabled:opacity-30 text-white p-3.5 rounded-xl transition-all shadow-glow active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="flex justify-between items-center mt-6">
                 <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Neural Protocol: Active</p>
                 <Sparkles className="w-4 h-4 text-indigo-500/40" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
