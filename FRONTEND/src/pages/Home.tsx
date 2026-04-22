import { Link } from 'react-router-dom';
import {
  ArrowRight, Brain, Users, MessageSquare, Video,
  Sparkles, BarChart2, Shield, Zap, TrendingUp,
  CheckCircle, Star, ChevronRight, Play
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

/* ── Data ── */
const MODULES = [
  {
    title: 'Aptitude',
    desc: 'Quantitative, logical & verbal reasoning with timed sessions and instant AI scoring.',
    icon: Brain,
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badge: 'Most Popular',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    path: '/aptitude',
  },
  {
    title: 'Interview Prep',
    desc: 'HR & technical interviews with STAR method guidance and structured AI feedback.',
    icon: Video,
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badge: 'Top Rated',
    badgeStyle: 'bg-violet-50 text-violet-700 border-violet-200',
    path: '/interview',
  },
  {
    title: 'Communication',
    desc: 'Speaking prompts with self-assessment for fluency, clarity, and confidence building.',
    icon: MessageSquare,
    color: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    badge: 'Essential',
    badgeStyle: 'bg-pink-50 text-pink-700 border-pink-200',
    path: '/communication',
  },
  {
    title: 'Group Discussion',
    desc: 'Timed GD topics with structured evaluation rubrics for placement rounds.',
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badge: 'New',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    path: '/gd-practice',
  },
];

const STATS = [
  { value: '500+', label: 'Practice Questions', color: 'text-indigo-600' },
  { value: '4', label: 'Training Modules', color: 'text-violet-600' },
  { value: 'AI', label: 'Powered Feedback', color: 'text-pink-600' },
  { value: '100%', label: 'Free to Start', color: 'text-emerald-600' },
];

const FEATURES = [
  {
    icon: BarChart2,
    title: 'Real-Time Analytics',
    desc: 'Track scores, spot weaknesses, and measure growth with an intelligent performance dashboard.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Shield,
    title: 'Curated Question Bank',
    desc: 'Questions aligned with actual placement patterns from TCS, Infosys, Wipro, and more.',
    gradient: 'from-violet-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Adaptive Difficulty',
    desc: 'The engine learns from your history and adjusts challenge levels to keep you in the flow zone.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Leaderboard Rankings',
    desc: 'Compete with peers, see how you rank nationally, and stay motivated with weekly streaks.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Placed at TCS Digital',
    text: "The aptitude module helped me crack the quantitative section I'd been struggling with for months. Got selected in first attempt!",
    avatar: 'P',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Rahul Mehta',
    role: 'Placed at Infosys',
    text: 'The mock interviews were incredibly realistic. I walked into the actual interview feeling completely prepared and confident.',
    avatar: 'R',
    color: 'from-violet-500 to-pink-500',
  },
  {
    name: 'Ananya Krishnan',
    role: 'Placed at Wipro',
    text: "The structured GD practice is genuinely different from anything else out there. My communication improved dramatically in 3 weeks.",
    avatar: 'A',
    color: 'from-pink-500 to-rose-500',
  },
];

/* ── Animations ── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: "easeOut" }
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Component ── */
export function Home() {
  const { profile, user } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try { await databaseService.fetchResources(); }
      catch { /* silent */ }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full bg-background min-h-screen overflow-x-hidden transition-colors duration-300">

      {/* ════════════════════════════════
          NAVBAR
      ════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-headingText text-[17px]" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
              Ace It Up
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="hidden md:block text-sm font-medium text-mutedText hover:text-headingText px-4 py-2 rounded-xl hover:bg-surface/50 transition-all">
              Sign In
            </Link>
            <Link to="/register" className="btn-wow px-5 py-2.5 text-[13px] rounded-xl">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-hero-liquid">
        {/* Background texture */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Glow orbs */}
        <div className="glow-orb w-[600px] h-[600px] bg-indigo-300/20 -top-40 -left-40" />
        <div className="glow-orb w-[500px] h-[500px] bg-purple-300/15 -bottom-20 -right-20" />
        <div className="glow-orb w-[300px] h-[300px] bg-pink-300/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 text-center py-20">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-sm text-primary text-xs font-semibold mb-8"
            style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Modern Placement Training Platform
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[900] leading-[0.95] tracking-[-0.04em] mb-8"
            style={{ fontFamily: 'Poppins, Inter, sans-serif', color: 'var(--color-text-heading)' }}
          >
            Ace It Up –{' '}
            <span className="text-wow animate-gradient-xy bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
              Smart Placement
            </span>
            <br />
            Training Platform
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            A complete training suite for Aptitude, Group Discussion, Communication, and Mock Interviews — built for students who want to land their dream job.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
          >
            {user ? (
              <>
                <Link to="/dashboard" className="btn-wow px-10 py-4 rounded-2xl text-base shadow-xl shadow-indigo-500/20">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/practice" className="btn-outline px-10 py-4 rounded-2xl text-base hover:bg-indigo-50/50">
                  <Play className="w-5 h-5 fill-indigo-600" /> Practice Now
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-wow px-10 py-4 rounded-2xl text-base shadow-xl shadow-indigo-500/20">
                  Start for Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-outline px-10 py-4 rounded-2xl text-base hover:bg-indigo-50/50">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: '#9CA3AF' }}
          >
            {[
              { icon: CheckCircle, text: 'No credit card needed' },
              { icon: CheckCircle, text: '500+ curated questions' },
              { icon: CheckCircle, text: 'Instant feedback' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-500" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="relative z-10 w-full max-w-4xl mx-auto px-5 md:px-8 pb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="bg-surface rounded-2xl p-5 text-center border border-border shadow-sm hover:-translate-y-1 transition-transform duration-300"
              >
                <p className={`text-3xl font-black tracking-tight ${s.color}`} style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {s.value}
                </p>
                <p className="text-xs text-mutedText mt-2 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════
          MODULES
      ════════════════════════════════ */}
      <section className="py-28 px-5 md:px-8 bg-surface">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <span className="badge-premium bg-indigo-50 text-indigo-700 border-indigo-200 mb-5 inline-flex">
                Training Modules
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black tracking-tight mb-5"
              style={{ fontFamily: 'Poppins, Inter, sans-serif', color: 'var(--color-text-heading)' }}
            >
              Everything you need to{' '}
              <span className="text-wow">get placed</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Four focused training environments built to bridge the gap between student and working professional.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODULES.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="glass-card bg-surface p-7 flex flex-col group cursor-pointer"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>

                {/* Badge */}
                <span className={`badge-premium ${item.badgeStyle} self-start mb-4 text-[10px]`}>
                  {item.badge}
                </span>

                {/* Content */}
                <h3 className="text-lg font-bold text-headingText mb-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed flex-grow" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>

                {/* CTA */}
                <Link
                  to={user ? item.path : '/register'}
                  className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-3 transition-all duration-300"
                  style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
                >
                  Start Practicing <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════
          FEATURES
      ════════════════════════════════ */}
      <section className="py-28 px-5 md:px-8" style={{ background: 'var(--gradient-soft)' }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <span className="badge-premium bg-purple-50 text-purple-700 border-purple-200 mb-6 inline-flex">
                Platform Capabilities
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: 'Poppins, Inter, sans-serif', color: 'var(--color-text-heading)' }}>
              Built for{' '}
              <span className="text-wow">serious</span>{' '}
              candidates
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
              Every feature is designed around one goal: getting you placed. Practice smarter, not harder.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/register" className="btn-wow px-7 py-3.5 rounded-xl text-sm inline-flex">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatedSection>

          {/* Feature grid */}
          <AnimatedSection className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-headingText text-sm mb-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>{f.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section className="py-28 px-5 md:px-8 bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <span className="badge-premium bg-emerald-50 text-emerald-700 border-emerald-200 mb-5 inline-flex">
                Student Success Stories
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="text-4xl md:text-5xl font-black tracking-tight mb-14"
              style={{ fontFamily: 'Poppins, Inter, sans-serif', color: 'var(--color-text-heading)' }}>
              Students who got{' '}
              <span className="text-wow">placed</span>
            </motion.h2>
          </AnimatedSection>

          {/* Testimonial slider */}
          <div className="relative min-h-[220px] mb-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: i === activeTestimonial ? 1 : 0,
                  y: i === activeTestimonial ? 0 : 12,
                  pointerEvents: i === activeTestimonial ? 'auto' : 'none',
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-2xl font-black mb-5 shadow-lg`}
                  style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {t.avatar}
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg md:text-xl italic leading-relaxed mb-5 max-w-xl" style={{ color: 'var(--color-text-body)' }}>
                  "{t.text}"
                </p>
                <div>
                  <p className="font-bold text-headingText" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>{t.name}</p>
                  <p className="text-sm text-primary font-medium">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-7 bg-primary' : 'w-2 bg-border hover:bg-mutedText'}`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CTA SECTION
      ════════════════════════════════ */}
      <section className="py-28 px-5 md:px-8" style={{ background: 'var(--gradient-soft)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl p-14 md:p-20 text-center shadow-lg"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight tracking-tight"
                style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                Ready to land your{' '}
                <span className="underline decoration-white/40 underline-offset-4">dream job?</span>
              </h2>
              <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Join thousands of students using Ace It Up to prepare smarter and get placed faster. It's completely free.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white font-bold text-[14px] uppercase tracking-wide hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
                style={{ color: 'var(--color-primary)', fontFamily: 'Poppins, Inter, sans-serif' }}
              >
                Create Your Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-indigo-200 text-sm mt-5">No credit card. No catch. Start now.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer className="py-12 px-5 md:px-8 bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-headingText" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
              Ace It Up
            </span>
          </div>

          <p className="text-sm text-mutedText">
            © 2025 Ace It Up · Built for placement excellence
          </p>

          <div className="flex gap-6">
            {['About', 'Privacy', 'Contact', 'Support'].map(link => (
              <Link
                key={link}
                to={`/${link.toLowerCase()}`}
                className="text-sm text-mutedText hover:text-primary transition-colors"
                style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
