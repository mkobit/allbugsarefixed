/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'josh-bg': 'hsl(210deg, 30%, 8%)',
        'josh-text': 'hsl(0deg, 0%, 100%)',
        'josh-primary': 'hsl(333deg, 100%, 52%)', // Pink
        'josh-secondary': 'hsl(180deg, 100%, 40%)', // Teal
        'josh-accent': 'hsl(250deg, 100%, 70%)', // Purple
        'josh-gray': 'hsl(210deg, 15%, 60%)',
      },
      fontFamily: {
        sans: [
          'Wotfard',
          'Futura',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['"Fira Code"', 'Fira Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.josh-primary'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.josh-secondary'),
                textDecoration: 'underline',
              },
            },
            h1: {
              color: theme('colors.gray.900'),
              fontWeight: '800',
            },
            'h1 strong, h2 strong, h3 strong, h4 strong': {
                color: 'inherit',
            },
            // Inline code styles
            code: {
              color: theme('colors.josh-primary'),
              fontWeight: '600',
              backgroundColor: theme('colors.gray.100'),
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            // Pre code (block) styles - override inline styles
            'pre code': {
              color: 'inherit',
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
            },
            pre: {
              backgroundColor: theme('colors.gray.900'),
              color: theme('colors.gray.100'),
              borderRadius: '0.5rem',
            },
            blockquote: {
              borderLeftColor: theme('colors.josh-secondary'),
              backgroundColor: theme('colors.gray.50'),
              fontStyle: 'normal',
              padding: '0.5rem 1rem',
              borderRadius: '0 0.5rem 0.5rem 0',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.josh-primary'),
              '&:hover': {
                color: theme('colors.josh-secondary'),
              },
            },
            h1: {
              color: theme('colors.gray.100'),
            },
            h2: {
              color: theme('colors.gray.100'),
            },
            h3: {
              color: theme('colors.gray.100'),
            },
            h4: {
              color: theme('colors.gray.100'),
            },
            strong: {
              color: theme('colors.gray.100'),
            },
            // Dark mode inline code
            code: {
              color: theme('colors.josh-accent'),
              backgroundColor: theme('colors.gray.800'),
            },
            // Dark mode pre/code block
            'pre code': {
              color: 'inherit',
              backgroundColor: 'transparent',
            },
            pre: {
              backgroundColor: theme('colors.gray.900'), // Or even darker/lighter depending on preference
              border: `1px solid ${theme('colors.gray.800')}`,
            },
            blockquote: {
              color: theme('colors.gray.100'),
              borderLeftColor: theme('colors.josh-secondary'),
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}
