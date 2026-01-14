import js from '@eslint/js'
import astroPlugin from 'eslint-plugin-astro'
import astroEslintParser from 'astro-eslint-parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { flat as mdxFlat, flatCodeBlocks as mdxFlatCodeBlocks } from 'eslint-plugin-mdx'
import globals from 'globals'
import sortKeysPlugin from 'eslint-plugin-sort-keys'
import functionalPlugin from 'eslint-plugin-functional'
import stylistic from '@stylistic/eslint-plugin'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default [
  {
    ignores: [
      '.astro/',
      'dist/',
      'node_modules/',
      'build/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      'scripts/verify-blog-structure.ts',
    ],
  },
  js.configs.recommended,
  // Stylistic rules - scoped to code files only to prevent corrupting Markdown/MDX
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.tsx', '**/*.astro'],
    ...stylistic.configs.recommended,
  },
  // TypeScript rules - balanced approach for Astro + Zod
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser, // Ensure browser globals are available for TS files which might be client-side
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'sort-keys': sortKeysPlugin,
      'functional': functionalPlugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...functionalPlugin.configs.recommended.rules,
      ...functionalPlugin.configs.noMutations.rules,
      ...functionalPlugin.configs.externalTypeScriptRecommended.rules,
      ...functionalPlugin.configs.stylistic.rules,
      // Key rules for type safety without being overly strict
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      // Object key ordering rule
      'sort-keys': ['error', 'asc', { caseSensitive: true, natural: true }],
      // Functional rules override/tweak
      'functional/no-try-statements': 'off', // Functional programming uses Result types, but we are in a hybrid env
      // functional/no-classes is enabled by default in recommended, so removing the disable line enables it.
      'functional/no-expression-statements': 'off', // React hooks (useEffect) and event handlers often return void/cleanup
      'functional/no-conditional-statements': 'off', // Conditionals are standard in this codebase; pattern matching is not yet pervasive
      'functional/no-return-void': 'off', // React callbacks and effects rely on void returns
      // Enable strict functional rules where possible
      'functional/no-this-expressions': 'error', // Avoid 'this', use pure functions
      'functional/functional-parameters': 'off', // Too restrictive for standard React component props and event handlers
      // Adjust immutability rules to be practical
      'functional/prefer-immutable-types': 'off',
      'functional/type-declaration-immutability': 'off',
      // Remove redundant rules as they are default errors in recommended
      'no-restricted-globals': [
        'error',
        {
          name: 'Date',
          message: 'Use Temporal instead of Date. Import Temporal from @js-temporal/polyfill.',
        },
      ],
    },
  },
  // Playwright Tests
  {
    files: ['tests/e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser, // Playwright tests can sometimes look like they use browser globals inside evaluate()
      },
    },
    rules: {
      'functional/no-let': 'off',
      'functional/immutable-data': 'off',
      'functional/no-loop-statements': 'off', // Tests often use loops for retries or data setup
      'functional/no-expression-statements': 'off',
      'functional/prefer-immutable-types': 'off',
      'functional/type-declaration-immutability': 'off',
    },
  },
  // Astro files
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        tsconfigRootDir,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
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
      ...astroPlugin.configs['jsx-a11y-recommended'].rules,
      'no-restricted-globals': [
        'error',
        {
          name: 'Date',
          message: 'Use Temporal instead of Date. Import Temporal from @js-temporal/polyfill.',
        },
      ],
      // Disable stylistic rules that conflict with Astro parsing/formatting
      '@stylistic/indent': 'off',
      '@stylistic/jsx-indent': 'off',
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/jsx-closing-tag-location': 'off',
      '@stylistic/jsx-closing-bracket-location': 'off',
    },
  },
  // Astro <script> blocks (browser context)
  {
    files: ['**/*.astro/*.js', '*.astro/*.js', '**/*.astro/*.ts', '*.astro/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Also disable problematic stylistic rules for script blocks if they cause issues
      // Usually indentation is weird in script blocks
      '@stylistic/indent': 'off',
      '@stylistic/jsx-indent': 'off',
    },
  },
  // Script files
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // MDX files - using default configuration
  {
    ...mdxFlat,
    rules: {
      ...mdxFlat.rules,
      '@stylistic/indent': 'off',
      '@stylistic/jsx-indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/max-statements-per-line': 'off',
      '@stylistic/jsx-closing-bracket-location': 'off',
      '@stylistic/jsx-one-expression-per-line': 'off',
    },
  },
  // MDX code blocks
  mdxFlatCodeBlocks,
]
