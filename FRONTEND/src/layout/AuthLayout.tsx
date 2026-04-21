import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 relative">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Ace It Up
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
