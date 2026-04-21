import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Credentials required for registration");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast.error(`Registration failed: ${error.message}`);
      setLoading(false);
      return;
    }

    toast.success("Account created! Please verify your email.");
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="glass-premium p-10 bg-white shadow-xl shadow-indigo-500/5 border border-slate-100">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6 shadow-sm">
           <UserPlus className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Initialize Account</h2>
        <p className="text-slate-500 text-sm font-medium">Join Ace It Up to scale your professional identity</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe" 
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
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
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
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
              <UserPlus className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-black">Create Profile</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-10 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        Already have an profile?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">
          Return to Portal
        </Link>
      </p>
    </div>
  );
}
