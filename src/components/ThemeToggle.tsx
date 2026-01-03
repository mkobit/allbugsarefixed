import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, type LucideIcon } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    } else {
      setTheme('system');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (targetTheme: Theme) => {
      let isDark = false;
      if (targetTheme === 'system') {
        isDark = mediaQuery.matches;
        // Check comment in plan: Removing theme key allows ThemeInit to handle it via matchMedia fallback on reload
        localStorage.removeItem('theme');
      } else {
        isDark = targetTheme === 'dark';
        localStorage.setItem('theme', targetTheme);
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, mounted]);

  if (!mounted) {
    // Return a placeholder of the same dimensions to minimize layout shift
    // Dimensions match the container div below
    return <div className="w-[88px] h-[34px]" aria-hidden="true" />;
  }

  return (
    <div
      className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 h-[34px]"
      role="radiogroup"
      aria-label="Theme toggle"
    >
      <ThemeButton
        selected={theme === 'light'}
        onClick={() => setTheme('light')}
        label="Light"
        icon={Sun}
      />
      <ThemeButton
        selected={theme === 'system'}
        onClick={() => setTheme('system')}
        label="System"
        icon={Monitor}
      />
      <ThemeButton
        selected={theme === 'dark'}
        onClick={() => setTheme('dark')}
        label="Dark"
        icon={Moon}
      />
    </div>
  );
}

function ThemeButton({ selected, onClick, label, icon: Icon }: { selected: boolean; onClick: () => void; label: string; icon: LucideIcon }) {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
        selected
          ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm scale-110 z-10'
          : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
      }`}
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}
