import React, { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  
  // Initialize theme from localStorage and system preference
  useEffect(() => {
    setMounted(true);
    const storedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') as Theme : null;
    
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      // Default to system preference
      applyTheme('system');
    }
  }, []);
  
  // Listen to system theme changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, mounted]);
  
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
      root.setAttribute('data-theme', systemPreference);
      root.style.colorScheme = systemPreference;
    } else {
      root.setAttribute('data-theme', newTheme);
      root.style.colorScheme = newTheme;
    }
  };
  
  const handleThemeChange = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    
    setTheme(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    applyTheme(newTheme);
  };
  
  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      case 'system':
        return 'Switch to light mode';
    }
  };
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
    }
  };
  
  const getCurrentThemeDescription = () => {
    switch (theme) {
      case 'light':
        return 'Light mode active';
      case 'dark':
        return 'Dark mode active';
      case 'system':
        return 'System preference active';
    }
  };
  
  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button 
        className="theme-toggle" 
        disabled 
        aria-label="Loading theme toggle"
      >
        <span aria-hidden="true">💻</span>
      </button>
    );
  }
  
  return (
    <button
      className="theme-toggle"
      onClick={handleThemeChange}
      aria-label={getThemeLabel()}
      title={getThemeLabel()}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle-icon">
        {getThemeIcon()}
      </span>
      <span className="sr-only">
        {getCurrentThemeDescription()}. {getThemeLabel()}.
      </span>
    </button>
  );
}