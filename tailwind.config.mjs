/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Colors and fonts are now handled in src/styles/global.css via @theme
      // Typography styles are handled via CSS components layer
    },
  },
  plugins: [
    // Typography plugin is loaded in CSS via @plugin
  ],
  darkMode: 'class',
}
