import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tighter uppercase">
          Recovery
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium tracking-tight">
          Enter your email to reset your secret path.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-premium p-10 bg-white">
          {!sent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-8 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Email Sent</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  We've sent a recovery link to <span className="text-slate-900 font-bold">{email}</span>. 
                  Check your inbox to reset your password.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
