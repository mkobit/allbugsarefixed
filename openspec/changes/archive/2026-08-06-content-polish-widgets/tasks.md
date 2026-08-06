<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=content-polish-widgets
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Footnote support

- [ ] 1.1 Add `remark-gfm` dependency (`bun add remark-gfm`).
  Validation: `cat package.json` shows `remark-gfm@^4.0.1`; `bun install` succeeds with no `minimumReleaseAge` block (already verified clear — release is from 2025-02-10).
- [ ] 1.2 Wire `remark-gfm` into both `remarkPlugins` arrays in `astro.config.mjs` (the `mdx()` integration config and the top-level `markdown` config, per the existing dual-registration pattern documented in the file's own comment).
  Validation: `bun run typecheck` passes; a scratch MDX file with `text[^1]` and `[^1]: note` renders a footnote reference and definitions section when previewed via `bun start`.
- [ ] 1.3 Add footnote section styling to `src/styles/global.css` (`.footnotes`/`[data-footnotes]` divider and muted note text) using the existing Tier-3 tokens from `abf-k7d.3` — no new tokens.
  Validation: manual visual check via `bun start` in both light and dark mode against the scratch footnote content from 1.2.
- [ ] 1.4 Manually verify no rendering regression on existing published/unlisted posts (the two `## Scratch`-only GFM-syntax matches found during design — `2026-01-13_the-hidden-costs-of-flexible-time-off` and `2026-03-14_bot-and-fraud-tsunami-in-tech` — should be unaffected since both are stripped pre-render).
  Validation: `bun start`, spot-check both posts render identically to pre-change; `bun run build` succeeds for the full site.

## 2. Table of contents active-heading indication

- [ ] 2.1 Create `src/components/TableOfContents.tsx` as a React port of the current `src/components/TableOfContents.astro` markup (same heading list, same depth <=3 filter, same styling).
  Validation: `bun run typecheck` passes; visually identical to the current `.astro` version when rendered with no scroll-spy behavior yet (static baseline).
- [ ] 2.2 Add `IntersectionObserver`-based scroll-spy: observe rendered heading elements, track the nearest-to-viewport-top heading per the `modern-web-guidance` `scroll-snap-state-sync` fallback algorithm, and set `aria-current="location"` plus a visual treatment on its corresponding TOC link.
  Validation: manual scroll-through of the longest existing post via `bun start`, confirming the active link updates correctly in both scroll directions including at the top and bottom of the post.
- [ ] 2.3 Update `src/pages/blog/[...slug].astro` to import and hydrate `TableOfContents.tsx` with `client:visible`, removing the old `.astro` component.
  Validation: `bun run build` succeeds; `bun run lint` and `bun run typecheck` pass; no references to the deleted `.astro` file remain (`rg TableOfContents.astro`).
- [ ] 2.4 Verify the progressive-enhancement fallback: TOC still renders as a fully functional static link list when JS is disabled or the observer fails to attach.
  Validation: manual check with browser JS disabled (or React DevTools throwing an error boundary) — links still navigate correctly, just without active-heading indication.

## 3. Full CI gate

- [ ] 3.1 Run the complete required CI command set and fix any failures.
  Validation: `bun scripts/verify-versions.mjs`, `bun run lint`, `bun run openspec:validate`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e` all pass.
