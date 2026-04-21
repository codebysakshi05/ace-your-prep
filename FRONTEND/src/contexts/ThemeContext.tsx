import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeProtocol = 'obsidian' | 'cyber-neon' | 'phantom-white';

interface ThemeContextType {
  theme: ThemeProtocol;
  setTheme: (theme: ThemeProtocol) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeProtocol>(() => {
    const saved = localStorage.getItem('ace-it-up-protocol');
    return (saved as ThemeProtocol) || 'phantom-white';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Set data-theme for CSS variables
    root.setAttribute('data-theme', theme);
    // Maintain legacy class support if needed
    root.classList.remove('obsidian', 'cyber-neon', 'phantom-white');
    root.classList.add(theme);
    
    // Light mode logic for phantom-white
    if (theme === 'phantom-white') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    localStorage.setItem('ace-it-up-protocol', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeProtocol) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
