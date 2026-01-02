import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('system');

  // Initialize state from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }
  }, []);

  // Effect to apply the theme
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (targetTheme: Theme) => {
      let resolvedTheme = targetTheme;
      if (targetTheme === 'system') {
        resolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      }

      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light-mode'); // Remove legacy class just in case
        document.body.classList.add('dark-mode'); // Legacy support if needed
        document.body.classList.remove('light-mode');
      } else {
        root.classList.remove('dark');
        root.classList.add('light-mode'); // Legacy support
        document.body.classList.add('light-mode'); // Legacy support
        document.body.classList.remove('dark-mode');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listener for system preference changes
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="sr-only">Theme:</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="p-1.5 rounded border border-brand-text/20 bg-brand-bg text-brand-text cursor-pointer text-sm"
      >
        <option value="system">System Default</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};
