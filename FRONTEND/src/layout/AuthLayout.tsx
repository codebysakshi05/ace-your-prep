import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Land your dream placement
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed">
            Ace It Up gives you the tools to practice, improve, and succeed in every stage of the placement process.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { stat: '500+', label: 'Practice Questions' },
              { stat: '4', label: 'Training Modules' },
              { stat: 'AI', label: 'Powered Insights' },
              { stat: 'Free', label: 'To Get Started' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{s.stat}</p>
                <p className="text-indigo-200 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <Link to="/" className="font-bold text-slate-900 text-lg">Ace It Up</Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
