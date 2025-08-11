import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://allbugsarefixed.com",
  base: "/",
  integrations: [mdx()],
  trailingSlash: "always",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
