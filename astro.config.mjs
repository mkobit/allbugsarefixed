import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import compress from "astro-compress";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// https://astro.build/config
export default defineConfig({
  site: "https://allbugsarefixed.com",
  base: "/",
  compressHTML: true,
  integrations: [mdx(), react(), icon(), compress()],
  trailingSlash: "always",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
        "@blog": fileURLToPath(new URL("./src/blog", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@content": fileURLToPath(new URL("./src/content", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
        "@public": fileURLToPath(new URL("./public", import.meta.url)),
      },
    },
  },
});
