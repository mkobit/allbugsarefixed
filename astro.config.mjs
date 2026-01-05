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
    }),
    react()
  ],
  trailingSlash: "always",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet'],
    }
  },
});
