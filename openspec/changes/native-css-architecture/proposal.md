## Why

Styling in the repository currently depends on Tailwind CSS v4, `tailwind-variants`, and `@tailwindcss/typography`.
This dependency introduces external framework coupling, increases client bundle overhead in hydrated islands, and limits direct usage of modern native CSS features.
Migrating to an internal modern CSS architecture removes external framework dependencies, eliminates runtime class merging, and provides clean cascade boundaries.

## What changes

- Replace `tailwind-variants` and utility classes across `src/components/ui/` with colocated CSS Modules (`<component>.module.css`) and HTML `data-*` attributes (`data-variant`, `data-size`).
- Replace `@tailwindcss/typography` with an internal `@layer typography` stylesheet (`src/styles/typography.css`) that uses `:where()` selectors, modern fluid sizing, and syntax highlighting isolation.
- Transition design tokens from Tailwind `@theme` utility generation to native CSS custom properties with `src/lib/tokens.gen.ts` TypeScript codegen and `bun run tokens:check` validation.
- Modernize layout components and widgets using container queries (`@container`), CSS subgrid (`grid-template-rows: subgrid`), `:has()` relational selectors, native scroll-driven animations, HTML `<dialog>` with `@starting-style`, and the Popover API.
- Introduce automated build-time checks and lint rules (`scripts/verify-css.ts`, ESLint AST rules, and CSS module validation) to prevent styling regressions.
- **BREAKING**: Remove `@tailwindcss/vite`, `@tailwindcss/typography`, `tailwind-variants`, and `tailwind-merge` dependencies.

## Capabilities

### New capabilities

- `native-component-styling`: Component styling using colocated CSS Modules, HTML `data-*` variant attributes, `@layer components`, and private custom properties (`--_*`).
- `native-article-typography`: Long-form prose styling using `@layer typography`, `:where()` selectors, fluid typography units, and isolated code blocks.
- `native-layout-modernization`: Responsive and interactive widget architecture using container queries, CSS subgrid, `:has()`, scroll timelines, HTML `<dialog>`, and Popover API.
- `css-architecture-validation`: Automated build-time validation and lint rules enforcing token usage, banning raw color literals, and checking CSS module references.

### Modified capabilities

- `ui-design-tokens`: Update the design token system contract from Tailwind `@theme` utility classes to native CSS custom properties consumed via `var()` and `src/lib/tokens.gen.ts`.

## Impact

- Affected code:
  - All components in `src/components/ui/` (`button.tsx`, `badge.tsx`, `callout.tsx`, `heading.tsx`, `table.tsx`, `stack.tsx`, `text.tsx`, `link.tsx`, `time.tsx`, `container.tsx`, `separator.tsx`, `ScrollProgress.tsx`, `changelog-view.tsx`, `PostHeader.tsx`, `PostMetadata.tsx`).
  - Layout and presentation widgets in `src/components/` (`BlogCard.tsx`, `Gallery.tsx`, `Lightbox.tsx`, `PostImageLightbox.tsx`, `Search.tsx`, `TableOfContents.tsx`, `CodeBlock.tsx`, `Header.tsx`, `Footer.tsx`).
  - Page shells and layouts in `src/layouts/Layout.astro` and `src/pages/` (`blog/[...slug].astro`, `about.astro`).
  - Global styles in `src/styles/global.css`, `src/styles/shiki.css`, and new `src/styles/typography.css`.
  - Utility helpers in `src/lib/ui.ts` and `src/lib/theme.ts`.
- Build and CI config:
  - `astro.config.mjs` removes `@tailwindcss/vite` and enables Lightning CSS.
  - `eslint.config.mjs` adds rules restricting raw color literals and validating CSS modules.
  - `package.json` adds `verify:css` script and updates `verify` script.
  - `.github/workflows/reusable-check.yml` and `mise.toml` include CSS verification.
- Dependencies:
  - Removed dependencies: `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`, `tailwind-variants`, `tailwind-merge`.
  - Dev dependencies may include `eslint-plugin-css-modules-next` subject to `minimumReleaseAge` policy.
