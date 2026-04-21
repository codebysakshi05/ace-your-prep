import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Credentials required for authentication");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Login failed: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Identity verified. Welcome back!");
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error("Google authentication failed: " + error.message);
    }
  };

  return (
    <div className="glass-premium p-10 bg-white shadow-xl shadow-indigo-500/5 border border-slate-100">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6 shadow-sm">
          <LogIn className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Welcome Back</h2>
        <p className="text-slate-500 text-sm font-medium">Continue your placement preparation journey</p>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          <Globe className="w-5 h-5 text-indigo-600" />
          <span className="text-xs uppercase tracking-widest font-black">Continue with Google</span>
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-slate-400">Password</label>
            <Link to="/forgot-password" title="Recover Access" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl py-4 pl-12 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 btn-premium py-5 shadow-indigo-500/20"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-black">Login to Dashboard</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-10 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        Don't have an profile?{' '}
        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">
          Initialize Account
        </Link>
      </p>
    </div>
  );
}
