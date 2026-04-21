import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LevelUpOverlay } from '../components/LevelUpOverlay';
import { CommandPalette } from '../components/CommandPalette';
import { AiMentorPanel } from '../components/AiMentorPanel';
import { PageTransition } from '../components/layout/PageTransition';
import { AnimatePresence } from 'framer-motion';

export function MainLayout() {
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; level: number }>({
    isOpen: false,
    level: 0
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleLevelUp = (event: any) => {
      const { level } = event.detail;
      setLevelUpData({ isOpen: true, level });
    };

    window.addEventListener('user-level-up', handleLevelUp);
    return () => window.removeEventListener('user-level-up', handleLevelUp);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Premium Atmospheric Background */}
      <div className="absolute inset-0 bg-noise z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/30 blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute right-[-5%] bottom-[-5%] w-[35%] h-[35%] rounded-full bg-purple-300/30 blur-[100px] pointer-events-none mix-blend-multiply"></div>
      
      <CommandPalette />
      <AiMentorPanel />
      <LevelUpOverlay 
        isOpen={levelUpData.isOpen} 
        level={levelUpData.level} 
        onClose={() => setLevelUpData(prev => ({ ...prev, isOpen: false }))} 
      />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:block md:translate-x-0 h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex flex-col flex-grow w-full max-w-full overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto h-full w-full">
            <AnimatePresence mode="wait">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
