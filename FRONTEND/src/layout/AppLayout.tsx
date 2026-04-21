import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaChevronRight } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LayoutDashboard, Globe, Shield, MessageCircle, Users, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../components/ThemeToggle';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden selection:bg-indigo-500/10 transition-colors duration-700">
      
      {/* 🧭 FLOATING GLASS HEADER (PHASE 3) */}
      <header 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-7xl transition-all duration-500 ${
          isScrolled 
            ? 'glass py-3 px-8 shadow-2xl shadow-indigo-500/10 border-white/40 dark:border-white/5 mx-auto' 
            : 'bg-transparent py-6 px-4 border-transparent'
        }`}
      >
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                A
             </div>
             <span className="text-2xl font-[900] text-slate-900 dark:text-white tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
               Ace It Up
             </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group ${
                  location.pathname === link.path ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1.5 left-0 h-[2px] bg-indigo-600 transition-all ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <Link 
                to="/dashboard" 
                className="btn-wow hidden sm:flex items-center gap-3 px-6 py-3 scale-95 hover:scale-100"
              >
                <LayoutDashboard className="w-4 h-4" /> COMMAND
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest hover:text-indigo-600 transition-colors hidden sm:flex items-center gap-2">
                   <LogIn className="w-4 h-4 text-indigo-600" /> Member Login
                </Link>
                <Link to="/register" className="btn-wow px-6 py-3 scale-95 hover:scale-100 hidden sm:flex">
                   ENLIST
                </Link>
              </div>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 glass rounded-xl text-slate-900 dark:text-white"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 PAGE TRANSITION SHELL */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-grow"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* 🏙️ ENTERPRISE FOOTER (MODERNIZED) */}
      <footer className="bg-slate-950 text-white pt-40 pb-20 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="space-y-10">
              <Link to="/" className="flex items-center gap-3">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-2xl">
                    A
                 </div>
                 <span className="text-3xl font-black tracking-tighter uppercase italic text-white">
                   Ace It Up
                 </span>
              </Link>
              <p className="text-slate-500 text-base leading-relaxed font-medium">
                Bridging the gap between raw potential and elite enterprise placement via intelligence protocols.
              </p>
              <div className="flex gap-5">
                {[FaTwitter, FaLinkedin, FaGithub, FaInstagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-indigo-500 hover:scale-110 transition-all group">
                    <Icon className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:pl-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-12">Intelligence Nodes</h4>
              <ul className="space-y-5">
                <li><Link to="/aptitude" className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-4 group"><Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /> Aptitude Base</Link></li>
                <li><Link to="/communication" className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-4 group"><Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /> Speech Forensics</Link></li>
                <li><Link to="/interview" className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-4 group"><Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /> Simulation Hub</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-12">Nexus Authority</h4>
              <ul className="space-y-5">
                <li><Link to="/leaderboard" className="text-slate-500 hover:text-white transition-colors text-sm font-bold">Global Standings</Link></li>
                <li><Link to="/recruiter" className="text-slate-500 hover:text-white transition-colors text-sm font-bold">Enterprise Nexus</Link></li>
                <li><Link to="/portfolio" className="text-slate-500 hover:text-white transition-colors text-sm font-bold">Public DNA</Link></li>
              </ul>
            </div>

            <div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-12">Terminal Updates</h4>
               <div className="glass-card p-6 border-white/5 bg-white/5 space-y-6">
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">Get high-priority node updates & intelligence dispatches.</p>
                 <div className="flex gap-2">
                    <input type="email" placeholder="node@protocol.com" className="bg-slate-900 border-white/5 text-xs w-full py-4" />
                    <button className="p-4 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all">
                       <FaChevronRight className="w-4 h-4" />
                    </button>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
              © 2026 ACE IT UP PROTOCOL. DOMINATE THE MARKET.
            </p>
            <div className="flex gap-10">
              <a href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Security</a>
              <a href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
