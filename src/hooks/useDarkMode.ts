import { useEffect, useState } from 'react';

/**
 * Hook to detect if the dark mode class is present on the document element.
 * It uses a MutationObserver to react to class changes on the <html> element.
 *
 * @returns boolean - True if 'dark' class is present on document.documentElement
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial check
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributeFilter: ['class'], attributes: true });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
