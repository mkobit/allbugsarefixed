import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import remarkReadingTime from "remark-reading-time";

// https://astro.build/config
export default defineConfig({
  site: "https://allbugsarefixed.com",
  base: "/",
  integrations: [
    mdx({
      remarkPlugins: [remarkReadingTime],
      // We need to extend the frontmatter with the reading time data
      // This is often done via a custom remark plugin wrapper, but
      // with Astro's mdx integration, we can access it via `remarkPluginFrontmatter` prop in the layout.
      // However, remark-reading-time puts it in file.data.readingTime.
      // Astro exposes file.data.astro.frontmatter.
      // We need a small plugin to bridge this.
      extendMarkdownConfig: true,
    }),
    react()
  ],
  markdown: {
    remarkPlugins: [
        remarkReadingTime,
        () => {
            return function (tree, file) {
                if (file.data.readingTime) {
                    // @ts-ignore
                    file.data.astro.frontmatter.readingTime = file.data.readingTime;
                }
            };
        }
    ]
  },
  trailingSlash: "always",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet'],
    }
  },
});
