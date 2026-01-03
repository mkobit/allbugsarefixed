import React from 'react';
import { Sun, Moon, Monitor, type LucideIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

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

interface ThemeButtonProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon: LucideIcon;
}

function ThemeButton({
  selected,
  onClick,
  label,
  icon: Icon
}: ThemeButtonProps) {
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
