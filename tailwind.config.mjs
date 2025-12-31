/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Semantic color names
        'brand-bg': 'var(--color-brand-bg)',
        'brand-text': 'var(--color-brand-text)',
        'brand-primary': 'var(--color-brand-primary)',
        'brand-secondary': 'var(--color-brand-secondary)',
        'brand-accent': 'var(--color-brand-accent)',
        'brand-surface': 'var(--color-brand-surface)',
      },
      fontFamily: {
        sans: [
          'Inter', // More standard, widely available
          'system-ui',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'], // Developer-focused
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.brand-primary'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.brand-secondary'),
                textDecoration: 'underline',
              },
            },
            // ... rest of typography
            code: {
               color: theme('colors.brand-primary'),
               backgroundColor: theme('colors.brand-surface'),
               padding: '0.2rem 0.4rem',
               borderRadius: '0.25rem',
               fontWeight: '600',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.brand-primary'),
              '&:hover': {
                color: theme('colors.brand-secondary'),
              },
            },
            code: {
              color: theme('colors.brand-accent'),
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
  ],
  darkMode: 'class',
}
