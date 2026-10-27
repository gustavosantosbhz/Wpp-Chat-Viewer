import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem('wpp-viewer-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark'; // armazenamento indisponível (modo privado, etc.)
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wpp-viewer-theme', theme);
    } catch {
      // ignora: o tema só não será lembrado
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
