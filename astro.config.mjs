import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import rehypeSlug from 'rehype-slug'
import remarkReadingTime from 'remark-reading-time'
import { remarkCodeToComponent } from './src/lib/remark/remark-code-component.mjs'
import { remarkCallout } from './src/lib/remark/remark-callout.ts'
import { remarkValidateMermaid } from './src/lib/remark/remark-mermaid-validate.mjs'
import { remarkMermaidToComponent } from './src/lib/remark/remark-mermaid-component.mjs'
import remarkMath from 'remark-math'
import { remarkMathToComponent } from './src/lib/remark/remark-math-component.mjs'

// https://astro.build/config
export default defineConfig({
  site: 'https://allbugsarefixed.com',
  base: '/',
  integrations: [
    mdx({ extendMarkdownConfig: true }),
    react(),
  ],
  markdown: {
    processor: '@astrojs/markdown-remark',
    syntaxHighlight: false,
    rehypePlugins: [rehypeSlug],
    remarkPlugins: [
      remarkReadingTime,
      remarkCallout,
      remarkMath,
      remarkMathToComponent,
      remarkCodeToComponent,
      remarkValidateMermaid,
      remarkMermaidToComponent,
      () => {
        return function (_tree, file) {
          if (file.data.readingTime) {
            // @ts-ignore
            file.data.astro.frontmatter.readingTime = file.data.readingTime
          }
        }
      },
    ],
  },
  trailingSlash: 'always',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet'],
    },
  },
})
