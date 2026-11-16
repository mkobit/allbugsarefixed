<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=native-css-architecture
  Note: Manually add label meta:openspec:native-css-architecture to the poured Expand Tasks bead and all child task beads.
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Token integration and CSS verification completion

- [ ] 1.1 Update `src/lib/theme.ts` to resolve chart theme colors via `getStaticTokenColor()` from `src/lib/tokens.gen.ts` instead of hardcoded hex strings.
  Validation: `bun run lint`, `bun run typecheck`, and `bun run test` pass with no raw hex literals in `src/lib/theme.ts`.
- [ ] 1.2 Migrate `src/styles/shiki.css` to declared design tokens in `src/styles/global.css`, regenerate `src/lib/tokens.gen.ts`, and remove `src/styles/shiki.css` from `EXCLUDED_FILES` in `scripts/verify-css.ts`.
  Validation: `bun run tokens:check`, `bun run verify:css`, and `bun run test` pass with `EXCLUDED_FILES` empty.

## 2. Native article typography

- [ ] 2.1 Extract `@layer typography` rules from `src/styles/global.css` into `src/styles/typography.css` using `:where()` zero-specificity selectors, fluid sizing, `70ch` measure, `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, and complete prose element coverage without `@apply`, then import `./typography.css` in `src/styles/global.css`.
  Validation: `bun run verify:css` and `bun run build` pass.
- [ ] 2.2 Migrate `src/components/CodeBlock.tsx` to a colocated `src/components/CodeBlock.module.css` inside `@layer components`, removing `!important` utility overrides and Tailwind classes.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run build` pass.
- [ ] 2.3 Update `src/pages/blog/[...slug].astro`, `src/pages/about.astro`, and `src/components/PostImageLightbox.tsx` to use `.article-prose` and native layout CSS instead of `@tailwindcss/typography` prose utility classes.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run build` pass.
- [ ] 2.4 Remove `@plugin "@tailwindcss/typography";` from `src/styles/global.css` and remove `@tailwindcss/typography` from `package.json`.
  Validation: `rg "@tailwindcss/typography" src/ package.json` returns no matches, and `bun run build` succeeds.

## 3. UI primitive migration

- [ ] 3.1 Migrate `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, and `src/components/ui/link.tsx` from `tailwind-variants` to colocated `.module.css` files in `@layer components` with `data-variant`, `data-size`, and `data-full-width` attributes, private custom properties (`--_*`), and `:hover:not(:disabled)`.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run test` pass; `rg "tailwind-variants" src/components/ui/badge.tsx src/components/ui/button.tsx src/components/ui/link.tsx` returns no matches.
- [ ] 3.2 Migrate `src/components/ui/callout.tsx` and `src/components/ui/heading.tsx` from `tailwind-variants` to colocated `.module.css` files in `@layer components` using `data-variant` and `data-level`, `@scope` for callout body content, and parent `:has(:hover)` for heading anchor links.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run test` pass; `rg "tailwind-variants" src/components/ui/callout.tsx src/components/ui/heading.tsx` returns no matches.
- [ ] 3.3 Migrate `src/components/ui/text.tsx`, `src/components/ui/time.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/PostHeader.tsx`, and `src/components/ui/PostMetadata.tsx` to colocated `.module.css` files in `@layer components` with `data-variant` and `data-size` attributes.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run test` pass; `rg "tailwind-variants" src/components/ui/text.tsx src/components/ui/time.tsx src/components/ui/separator.tsx src/components/ui/PostHeader.tsx src/components/ui/PostMetadata.tsx` returns no matches.
- [ ] 3.4 Migrate `src/components/ui/container.tsx` and `src/components/ui/stack.tsx` from `tailwind-variants` to colocated `.module.css` files in `@layer components` with `data-size`, `data-direction`, `data-align`, `data-justify`, and `data-gap` attributes.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run test` pass; `rg "tailwind-variants" src/components/ui/container.tsx src/components/ui/stack.tsx` returns no matches.
- [ ] 3.5 Migrate `src/components/ui/table.tsx` and `src/components/ui/changelog-view.tsx` to colocated `.module.css` files in `@layer components` using `:has()` relational selectors and semantic tokens.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run test:e2e` pass.

## 4. Layout, overlay, and widget modernization

- [ ] 4.1 Migrate `src/components/ui/ScrollProgress.tsx` to native CSS scroll-driven animations (`animation-timeline: scroll()`) with a colocated `.module.css` file, and update `tests/e2e/ui/scroll-progress.spec.ts` to test without Tailwind utility class mutations.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run test:e2e` pass.
- [ ] 4.2 Migrate `src/components/Lightbox.tsx`, `src/components/Gallery.tsx`, and `src/components/PostImageLightbox.tsx` from `@headlessui/react` and `tailwind-variants` to native HTML `<dialog>` with `@starting-style` transitions, `@container` queries, and colocated `.module.css` files.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run build` pass; `rg "tailwind-variants" src/components/Lightbox.tsx src/components/Gallery.tsx src/components/PostImageLightbox.tsx` returns no matches.
- [ ] 4.3 Migrate `src/components/Search.tsx`, `src/components/ThemeToggle.tsx`, `src/components/Footer.tsx`, `src/components/LabelBadge.tsx`, and `src/components/TableOfContents.tsx` from `tailwind-variants` and utility classes to colocated `.module.css` files using the HTML Popover API, `@container` queries, and `data-*` state attributes.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run build` pass; `rg "tailwind-variants" src/components/Search.tsx src/components/ThemeToggle.tsx src/components/Footer.tsx src/components/LabelBadge.tsx src/components/TableOfContents.tsx` returns no matches.
- [ ] 4.4 Migrate remaining content widgets and page shells (`src/components/IconBlock.tsx`, `src/components/EChart.tsx`, `src/components/PigeonMap.tsx`, `src/components/Mermaid.astro`, `src/components/Latex.astro`, `src/layouts/Layout.astro`, `src/pages/blog/index.astro`, and `src/content/blog/2024-05-20_tech-demo/index.mdx`) from Tailwind utility classes to native CSS and colocated `.module.css` files.
  Validation: `bun run lint`, `bun run typecheck`, `bun run verify:css`, and `bun run build` pass.

## 5. Tailwind removal and compiler cleanup

- [ ] 5.1 Declare `@layer reset, base, theme, typography, components, utilities;` in `src/styles/global.css`, replace `@apply` rules with native CSS properties, and remove `@import "tailwindcss";` and the `@theme` block while keeping `src/lib/tokens.gen.ts` in sync.
  Validation: `bun run tokens:check` and `bun run verify:css` pass; `rg "@import \"tailwindcss\"|@theme|@apply" src/styles/` returns no matches.
- [ ] 5.2 Simplify `cn()` in `src/lib/ui.ts` to concatenate class strings without `tailwind-merge`, remove `tailwind-variants`, `tailwind-merge`, `@tailwindcss/vite`, and `tailwindcss` from `package.json`, remove `@tailwindcss/vite` from `astro.config.mjs`, and enable Lightning CSS in `astro.config.mjs`.
  Validation: `rg "tailwindcss|tailwind-variants|tailwind-merge" package.json src/ astro.config.mjs` returns no active imports or dependencies, and `bun run build` succeeds.
- [ ] 5.3 Remove the legacy `bg-brand-surface` utility class in `src/components/ui/SiteHeader.tsx` and update `tests/e2e/reachability/layout.spec.ts`, then run the full CI check suite (`mise run check`).
  Validation: `mise run check` passes all 9 verification steps (`verify:versions`, `verify:css`, `lint`, `openspec:validate`, `typecheck`, `test`, `coverage`, `build`, `test:e2e`).
