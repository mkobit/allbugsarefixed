import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import astroPlugin from "eslint-plugin-astro";
import astroEslintParser from "astro-eslint-parser";
import * as mdxPlugin from "eslint-plugin-mdx";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
export default [
  {
    ignores: [".astro/", "dist/"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "module",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...typescriptEslint.configs["eslint-recommended"].rules,
      ...typescriptEslint.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.astro"],
    plugins: {
      astro: astroPlugin,
    },
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        extraFileExtensions: [".astro"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...astroPlugin.environments.astro.globals,
      },
    },
    processor: astroPlugin.processors.astro,
    rules: {
      ...astroPlugin.configs.recommended.rules,
      ...astroPlugin.configs["jsx-a11y-recommended"].rules,
    },
  },

  {
    ...mdxPlugin.flat,
  },
  {
    ...mdxPlugin.flatCodeBlocks,
  },
  {
    ...compat.config({
      extends: ["prettier"],
    })[0],
  },
];
