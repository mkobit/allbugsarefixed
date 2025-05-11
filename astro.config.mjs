import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx'; // Import mdx

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()] // Add mdx() here
});
