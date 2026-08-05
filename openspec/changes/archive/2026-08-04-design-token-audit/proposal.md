## Why

`abf-k7d.3` asked for an audit of the existing Tailwind v4 design-token system before more widgets get added (`abf-k7d.1`/`abf-k7d.2`), since inconsistent styling gets harder to fix the more components pile on top of it.
The audit (this session, 2026-08-03) found `src/styles/global.css`'s `@theme` block defines only 6 color tokens (`brand-bg`/`text`/`primary`/`secondary`/`accent`/`surface`) with no tier above that.
As a result, 9 of the 14 components in `src/components/ui` hand-roll raw Tailwind gray-scale utilities paired with manual `dark:` variants instead of using a token — the same pair (`text-gray-500 dark:text-gray-400`) is copy-pasted verbatim across `PostMetadata.tsx`, `time.tsx` (twice), and `text.tsx`; `text-gray-300 dark:text-gray-700` repeats in `separator.tsx` and `text.tsx`; `border-gray-200 dark:border-gray-800` repeats twice in `table.tsx`.
`callout.tsx` has the same gap one level deeper: its 4 semantic states (error/info/tip/warning) each hardcode a raw Tailwind color family (red/blue/emerald/yellow) across 3 roles (bg/border/text) × 2 modes, uncoupled from the token system entirely.
This is scoped narrowly to fixing that duplication now; broader native-CSS feature adoption (scroll-driven animations, view transitions, further `:has()`, container queries, `color-scheme`/`light-dark()` dark-mode consolidation) was evaluated in the same audit and explicitly deferred as out of scope for this change.

## What Changes

- Add a Tier-3 "UI-level" token layer to `src/styles/global.css`'s `@theme` block, above the existing Tier-1/2 `brand-*` tokens, for the semantic concepts currently hand-duplicated: muted text, dim/subtle text, subtle border, and hover-surface background. Exact token names and light/dark values are a design decision (see `design.md`).
- Add component-specific tokens for `callout.tsx`'s 4 semantic states (error/info/tip/warning), replacing the raw `red-50`/`red-900`/etc. Tailwind palette references with token-backed values that resolve through the same `:root`/`.dark` mechanism as the rest of the token system.
- Migrate 8 affected components (`PostMetadata.tsx`, `time.tsx`, `text.tsx`, `separator.tsx`, `table.tsx`, `button.tsx`, `heading.tsx`, `link.tsx`) from raw gray-scale + `dark:` pairs to the new tokens, and `callout.tsx` from raw semantic-color pairs to the new callout tokens.
- **Correction (2026-08-04, caught by this change's own sweep task):** `ScrollProgress.tsx` was originally listed here too, but its raw-gray patterns (`bg-white dark:bg-gray-800` — a "raised surface" distinct from hover-surface since light mode is plain white, not gray-100; `ring-gray-200 dark:ring-gray-700` and `text-gray-200 dark:text-gray-700` — a 200/700 pair matching neither `--color-ui-border` (200/800) nor `--color-ui-border-strong` (300/700)) don't map onto any token decided in `design.md`. Migrating it would mean inventing new tokens without the same value-sourcing and adversarial-review rigor given to the rest — deferred to a follow-up instead of scope-creeping this change to cover it.
- No change to the 6 existing `brand-*` tokens or to any component's visual output beyond what's needed to keep current colors byte-for-byte (or perceptually) equivalent — this is a de-duplication of the token system, not a redesign.

## Capabilities

### New Capabilities
- `ui-design-tokens`: the design-token system's tiering contract — which semantic UI concepts (muted text, subtle border, hover surface, callout states) must be backed by a `@theme` token rather than a raw Tailwind palette utility, so components can't reintroduce the same duplication this change removes.

### Modified Capabilities
- None. `openspec/specs/` currently only has `blog-planning-via-beads`, which is unrelated to component styling.

## Impact

- `src/styles/global.css`: `@theme` block gains the new Tier-3 tokens; `:root`/`.dark` blocks gain their light/dark values.
- `src/components/ui/{PostMetadata,time,text,separator,table,button,heading,link,callout}.tsx`: raw gray-scale/semantic-color Tailwind utilities replaced with the new tokens. `ScrollProgress.tsx` is explicitly not touched — see the correction above.
- No build, CI, or dependency changes — this stays within the existing Tailwind v4 `@theme` mechanism already in use.
- Visual verification: `bun start` + a Playwright screenshot of `src/content/blog/2024-05-20_tech-demo/index.mdx` (the one post exercising Callout/Table/Badge) in both light and dark mode, compared against the pre-change baseline captured this session.
