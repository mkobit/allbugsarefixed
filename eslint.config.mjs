import js from "@eslint/js";
import astroPlugin from "eslint-plugin-astro";
import astroEslintParser from "astro-eslint-parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { flat as mdxFlat, flatCodeBlocks as mdxFlatCodeBlocks } from "eslint-plugin-mdx";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import sortKeysPlugin from "eslint-plugin-sort-keys";
import { fileURLToPath } from "url";
import { dirname } from "path";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [".astro/", "dist/", "node_modules/", "build/", "coverage/"],
  },
  js.configs.recommended,
  // TypeScript rules - balanced approach for Astro + Zod
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "sort-keys": sortKeysPlugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...typescriptEslint.configs["stylistic"].rules,
      // Key rules for type safety without being overly strict
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
      // Object key ordering rule
      "sort-keys": ["error", "asc", { caseSensitive: true, natural: true }],
    },
  },
  // Astro files
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        project: "./tsconfig.json",
        tsconfigRootDir,
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...astroPlugin.environments.astro.globals,
      },
    },
    plugins: {
      astro: astroPlugin,
    },
    processor: astroPlugin.processors.astro,
    rules: {
      ...astroPlugin.configs.recommended.rules,
      ...astroPlugin.configs["jsx-a11y-recommended"].rules,
    },
  },
  // Astro <script> blocks (browser context)
  {
    files: ["**/*.astro/*.js", "*.astro/*.js", "**/*.astro/*.ts", "*.astro/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {},
  },
  // Script files
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // MDX files - using default configuration
  mdxFlat,
  // MDX code blocks
  mdxFlatCodeBlocks,
  // Prettier config last
  prettierConfig,
];
