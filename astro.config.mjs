import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import rehypeSlug from 'rehype-slug'
import remarkReadingTime from 'remark-reading-time'
import { remarkStripScratch } from './src/lib/remark/remark-strip-scratch.ts'
import { remarkCodeToComponent } from './src/lib/remark/remark-code-component.mjs'
import { remarkCallout } from './src/lib/remark/remark-callout.ts'
import { remarkValidateMermaid } from './src/lib/remark/remark-mermaid-validate.mjs'
import { remarkMermaidToComponent } from './src/lib/remark/remark-mermaid-component.mjs'
import remarkMath from 'remark-math'
import { remarkMathToComponent } from './src/lib/remark/remark-math-component.mjs'
import { remarkReadingTimeFrontmatter } from './src/lib/remark/remark-reading-time-frontmatter.ts'

// https://astro.build/config
export default defineConfig({
  site: 'https://allbugsarefixed.com',
  base: '/',
  integrations: [
    mdx({
      // extendMarkdownConfig only merges markdown.remarkPlugins in when this
      // list is left undefined -- since we set it explicitly, every plugin
      // needed for .mdx (all posts are .mdx) must be listed here too,
      // including the reading-time frontmatter bridge below.
      remarkPlugins: [remarkStripScratch, remarkCallout, remarkReadingTime, remarkReadingTimeFrontmatter, remarkMath, remarkMathToComponent, remarkCodeToComponent, remarkValidateMermaid, remarkMermaidToComponent],
      extendMarkdownConfig: true,
    }),
    react(),
  ],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [rehypeSlug],
    remarkPlugins: [
      remarkStripScratch,
      remarkReadingTime,
      remarkReadingTimeFrontmatter,
      remarkCallout,
      remarkMath,
      remarkMathToComponent,
      remarkCodeToComponent,
      remarkValidateMermaid,
      remarkMermaidToComponent,
    ],
  },
  trailingSlash: 'always',
  output: 'static',
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet'],
    },
  },
})
