import js from "@eslint/js";
import astroPlugin from "eslint-plugin-astro";
import astroEslintParser from "astro-eslint-parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { flat as mdxFlat, flatCodeBlocks as mdxFlatCodeBlocks } from "eslint-plugin-mdx";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import sortKeysPlugin from "eslint-plugin-sort-keys";
import functionalPlugin from "eslint-plugin-functional";
import { fileURLToPath } from "url";
import { dirname } from "path";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [".astro/", "dist/", "node_modules/", "build/", "coverage/", "playwright-report/", "test-results/"],
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
        ...globals.browser, // Ensure browser globals are available for TS files which might be client-side
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "sort-keys": sortKeysPlugin,
      functional: functionalPlugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...typescriptEslint.configs["stylistic"].rules,
      ...functionalPlugin.configs.recommended.rules,
      // Key rules for type safety without being overly strict
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
      // Object key ordering rule
      "sort-keys": ["error", "asc", { caseSensitive: true, natural: true }],
      // Functional rules override/tweak
      "functional/no-let": "error",
      "functional/immutable-data": "error",
      "functional/no-try-statements": "off", // Functional programming uses Result types, but we are in a hybrid env
      // functional/no-classes is enabled by default in recommended, so removing the disable line enables it.
      "functional/no-expression-statements": "off", // React hooks (useEffect) and event handlers often return void/cleanup
      "functional/no-conditional-statements": "off", // Conditionals are standard in this codebase; pattern matching is not yet pervasive
      "functional/no-return-void": "off", // React callbacks and effects rely on void returns
      // Enable strict functional rules where possible
      "functional/no-mixed-types": "error", // Enforce strict type definitions, suppress where necessary
      "functional/no-loop-statements": "error", // Prefer functional iteration (map, reduce, recursion)
      "functional/no-this-expressions": "error", // Avoid 'this', use pure functions
      "functional/functional-parameters": "off" // Too restrictive for standard React component props and event handlers
    },
  },
  // Playwright Tests
  {
    files: ["tests/e2e/**/*.ts", "playwright.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser, // Playwright tests can sometimes look like they use browser globals inside evaluate()
      },
    },
    rules: {
      "functional/no-let": "off",
      "functional/immutable-data": "off",
      "functional/no-loop-statements": "off", // Tests often use loops for retries or data setup
      "functional/no-expression-statements": "off"
    }
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
