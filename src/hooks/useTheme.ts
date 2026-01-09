import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function useTheme(): Readonly<{ mounted: boolean; setTheme: React.Dispatch<React.SetStateAction<Theme>>; theme: Theme }> {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (isTheme(stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // eslint-disable-next-line functional/prefer-immutable-types
    const root = document.documentElement;
    // eslint-disable-next-line functional/prefer-immutable-types
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (targetTheme: Theme) => {
      const isDark =
        targetTheme === 'system' ? mediaQuery.matches : targetTheme === 'dark';

      if (targetTheme === 'system') {
        localStorage.removeItem('theme');
      } else {
        localStorage.setItem('theme', targetTheme);
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const handleSystemChange = (e: Readonly<MediaQueryListEvent>) => {
      if (theme === 'system') {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, mounted]);

  return { mounted, setTheme, theme };
}
