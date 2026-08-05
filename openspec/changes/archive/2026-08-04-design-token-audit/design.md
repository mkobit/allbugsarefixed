## Context

The audit behind this change (session of 2026-08-03, see `abf-k7d.3`) read `src/styles/global.css`'s `@theme` block and all 14 files in `src/components/ui`.
The token system currently has exactly 6 Tier-1/2 color tokens (`--color-brand-bg/text/primary/secondary/accent/surface`), each with a `:root` (light) and `.dark` (dark-class) value.
Nothing above that tier exists, so components needing a secondary text color, a subtle border, a hover background, or a semantic status color reach for raw Tailwind gray-scale/palette utilities plus a hand-written `dark:` variant instead.
Exact current values were pulled from the installed `tailwindcss@4.3.3` package (`node_modules/tailwindcss/theme.css`) rather than approximated, so the new tokens can reproduce today's rendered colors precisely.

## Goals / Non-Goals

**Goals:**
- Add a Tier-3 "UI-level" token set for the recurring concepts found duplicated: muted text, dim text, two distinct border weights, and hover-surface background.
- Add Tier-4 component tokens for `callout.tsx`'s 4 semantic states.
- Migrate the 9 affected components onto these tokens (or, where the raw values already match an *existing* token, onto that token instead of inventing a new one).
- Preserve current rendered colors in both light and dark mode, verified with a real before/after screenshot.

**Non-Goals:**
- No native-CSS feature adoption (scroll-driven animations, view transitions, further `:has()`, container queries, `color-scheme`/`light-dark()`) — deferred per the user's explicit scope decision this session.
- No redesign of the color palette itself (hues, brand colors) — this only restructures *how* existing colors are referenced.
- No change to `callout.tsx`'s icon/layout markup, only its color-producing classes.

## Decisions

**1. Reuse `--color-brand-text` instead of inventing a token for near-black/near-white text.**
`heading.tsx`'s base style is already `text-gray-900 dark:text-brand-text` — an inconsistency where only the dark side uses the token. `table.tsx`'s cell text (`text-gray-900 dark:text-gray-100`) and `button.tsx`'s ghost/outline text (same pair) are visually near-identical to `--color-brand-text`'s existing values (`hsl(222, 47%, 11%)` light / `hsl(210, 40%, 98%)` dark vs. raw `gray-900`/`gray-100`). Rather than add a redundant token, these three sites migrate to the existing `--color-brand-text`, and `heading.tsx`'s light side is fixed to match its dark side.
*Alternative considered:* a new `--color-ui-text-strong` token mirroring gray-900/gray-100 exactly. Rejected — it would duplicate `--color-brand-text` almost exactly, reintroducing the same "two names for one concept" problem this change exists to remove.

**2. New Tier-3 tokens, values pinned to Tailwind's own default oklch values (not approximated):**

| Token | Light | Dark | Replaces |
|---|---|---|---|
| `--color-ui-text-muted` | `oklch(55.1% 0.027 264.364)` (gray-500) | `oklch(70.7% 0.022 261.325)` (gray-400) | `text-gray-500 dark:text-gray-400` in `PostMetadata.tsx`, `time.tsx` (base + `muted` variant), `text.tsx` (base + `muted` variant), `table.tsx` head |
| `--color-ui-text-dim` | `oklch(87.2% 0.01 258.338)` (gray-300) | `oklch(37.3% 0.034 259.733)` (gray-700) | `text-gray-300 dark:text-gray-700` in `text.tsx` `dim` variant, `separator.tsx` |
| `--color-ui-border` | `oklch(92.8% 0.006 264.531)` (gray-200) | `oklch(27.8% 0.033 256.848)` (gray-800) | `border-gray-200 dark:border-gray-800` in `table.tsx` row + wrapper |
| `--color-ui-border-strong` | `oklch(87.2% 0.01 258.338)` (gray-300) | `oklch(37.3% 0.034 259.733)` (gray-700) | `border-gray-300 dark:border-gray-700` in `button.tsx` outline variant |
| `--color-ui-surface-hover` | `oklch(96.7% 0.003 264.542)` (gray-100) | `oklch(27.8% 0.033 256.848)` (gray-800) | `hover:bg-gray-100 dark:hover:bg-gray-800` in `button.tsx` ghost/outline; `bg-gray-100/50 dark:bg-gray-800/50` (table row hover, via Tailwind's `/50` opacity modifier on the token) and `bg-gray-100 dark:bg-gray-800` (table selected-row state) in `table.tsx` |

`--color-ui-border` and `--color-ui-border-strong` are kept as two distinct tokens rather than merged into one, even though both represent "a subtle border" conceptually — the underlying values genuinely differ today (200/800 vs. 300/700) and nothing in the audit indicates that difference was accidental. Force-merging them would be a real (if small) visual change dressed up as de-duplication.

**3. `link.tsx`'s default variant (`text-gray-600 dark:text-gray-400`) is consolidated into `--color-ui-text-muted`, not given its own token.**
Its dark value (`gray-400`) already matches the muted-text token exactly; only the light value differs by one Tailwind step (`gray-600` vs. `gray-500`). This is the one place this change accepts a small, deliberate visual delta rather than adding a 6th near-duplicate token — flagged explicitly here (not silently) and covered by the visual verification step.

**4. Callout tokens use `color-mix()` computed once at token-definition time for dark-mode backgrounds, not a per-usage opacity modifier.**
Today's dark-mode callout backgrounds are `bg-red-900/20` (etc.) — a 20%-opacity overlay applied where the component is used. To keep the token itself a single solid, mode-appropriate color (consistent with how every other token in this system works — one flat value per mode, no opacity math at the call site), each `-bg` token's dark value is defined as `color-mix(in oklab, <state-900-oklch> 20%, var(--color-brand-bg))` inside the `.dark {}` block, referencing the already-defined `--color-brand-bg`. This computes the same 20%-over-background blend the current opacity modifier produces, but bakes it into the token so `callout.tsx` can just write `bg-callout-error-bg` with no `dark:` prefix or modifier, matching every other token in the file. Light-mode `-bg` values are direct copies of the existing solid `-50` shades (no mixing needed, since light mode never used an opacity trick).
*Alternative considered:* keep the `/20` opacity modifier and put it on a `dark:bg-callout-error-bg/20` utility. Rejected — it would be the only token in the system requiring a `dark:`-prefixed override, working against the same "the token already knows its mode" pattern `--color-brand-*` establishes.

Full callout token table:

| State | Role | Light | Dark |
|---|---|---|---|
| error | bg | `oklch(97.1% 0.013 17.38)` (red-50) | `color-mix(in oklab, oklch(39.6% 0.141 25.723) 20%, var(--color-brand-bg))` (red-900 @ 20%) |
| error | border | `oklch(88.5% 0.062 18.334)` (red-200) | `oklch(44.4% 0.177 26.899)` (red-800) |
| error | text | `oklch(44.4% 0.177 26.899)` (red-800, as currently used for `text-red-800`) | `oklch(88.5% 0.062 18.334)` (red-200, as currently used for `dark:text-red-200`) |
| info | bg | `oklch(97% 0.014 254.604)` (blue-50) | `color-mix(in oklab, oklch(37.9% 0.146 265.522) 20%, var(--color-brand-bg))` (blue-900 @ 20%) |
| info | border | `oklch(88.2% 0.059 254.128)` (blue-200) | `oklch(42.4% 0.199 265.638)` (blue-800) |
| info | text | `oklch(42.4% 0.199 265.638)` (blue-800) | `oklch(88.2% 0.059 254.128)` (blue-200) |
| tip | bg | `oklch(97.9% 0.021 166.113)` (emerald-50) | `color-mix(in oklab, oklch(37.8% 0.077 168.94) 20%, var(--color-brand-bg))` (emerald-900 @ 20%) |
| tip | border | `oklch(90.5% 0.093 164.15)` (emerald-200) | `oklch(43.2% 0.095 166.913)` (emerald-800) |
| tip | text | `oklch(43.2% 0.095 166.913)` (emerald-800) | `oklch(90.5% 0.093 164.15)` (emerald-200) |
| warning | bg | `oklch(98.7% 0.026 102.212)` (yellow-50) | `color-mix(in oklab, oklch(42.1% 0.095 57.708) 20%, var(--color-brand-bg))` (yellow-900 @ 20%) |
| warning | border | `oklch(94.5% 0.129 101.54)` (yellow-200) | `oklch(47.6% 0.114 61.907)` (yellow-800) |
| warning | text | `oklch(47.6% 0.114 61.907)` (yellow-800) | `oklch(94.5% 0.129 101.54)` (yellow-200) |

**5. Out-of-scope raw-gray occurrences found during the audit are explicitly left alone, not silently swept in:**
`button.tsx`'s `focus:ring-gray-500` (no `dark:` override today) and `heading.tsx`'s anchor-link `text-gray-400` (also no `dark:` override) were not part of the 4-concept set presented to the user for this scoped change. Migrating them is left for a follow-up rather than expanding this change's surface.

`ScrollProgress.tsx` was originally listed in the proposal's component set, then dropped here without saying so — caught by this change's own sweep task and corrected in `proposal.md`. Its 3 raw-gray occurrences (`bg-white dark:bg-gray-800`, `ring-gray-200 dark:ring-gray-700`, `text-gray-200 dark:text-gray-700`) don't map onto any token decided above: the bg pair is a "raised surface" concept (light = plain white, not gray-100, so it's not `--color-ui-surface-hover`), and the ring/text pair is a 200/700 combination matching neither `--color-ui-border` (200/800) nor `--color-ui-border-strong` (300/700). Deferred to a follow-up rather than inventing new tokens mid-implementation without the same rigor given to the rest.

## Risks / Trade-offs

- **[Risk]** The `color-mix(in oklab, ...)` technique for callout dark backgrounds is mathematically close to, but not guaranteed pixel-identical to, the current alpha-composited `bg-red-900/20`-over-solid-background rendering (OKLab mixing vs. sRGB alpha compositing are different math). → **Mitigation:** `tech-demo`'s post exercises all 4 callout types in both modes; the before/after Playwright screenshots (already captured for light/dark as a baseline this session) are compared specifically on the 4 callout blocks, not just spot-checked.
- **[Risk]** Consolidating `link.tsx` (Decision 3) and choosing not to consolidate the two border tokens (Decision 2) are both judgment calls, not derived mechanically — a different reviewer could reasonably draw the line differently. → **Mitigation:** both calls are written down here with rationale, not just implemented silently, so they're reviewable/reversible in isolation from the rest of the change.
- **[Trade-off]** `--color-ui-border` and `--color-ui-border-strong` being distinct tokens means the token system still has two "subtle border" concepts rather than one — this is honest about current reality rather than forcing a false consolidation, but it does mean a future component author has to pick the right one. → Accepted; documented in the `ui-design-tokens` spec's scenario for border tokens.

## Adversarial review and mitigations

- **Objection: "Why introduce 5 new Tier-3 tokens plus 12 Tier-4 callout tokens for a personal blog with 14 components? Isn't this over-engineering the token system relative to its actual scale?"**
  Mitigation: every new token replaces a value that was *already* duplicated 2+ times verbatim in the audit (not a speculative future need) — `--color-ui-text-muted` alone collapses 6 call sites. The callout tokens replace 4 states × 3 roles that were already fully enumerated in the component; nothing new is being anticipated. Per the guidance this audit was run against ("the smaller the scope, the fewer tiers it needs — do not overengineer"), a 4th tier (component-specific tokens beyond callout) is explicitly *not* being introduced here.
- **Objection: "The `color-mix()` dark-callout technique is more complex than just keeping the existing `/20` opacity modifier — is the consistency gain worth the added complexity of a browser feature (`color-mix()`) most of the rest of this codebase doesn't use yet?"**
  Mitigation: `color-mix()` is Baseline widely available (since 2023) and this repo has no stated browser-support policy excluding it. The complexity is contained entirely to `global.css`'s token definitions — `callout.tsx` itself gets *simpler* (one class per role, no `dark:` prefixes, no opacity modifiers), which is where the guidance's "prefer built-in conventions over duplication" principle actually bites hardest, since that's the file most likely to grow new states later.
- **Objection: "How do we know the new tokens actually reproduce the old colors, rather than just trusting oklch-value transcription?"**
  Mitigation: every light-mode value and every non-`color-mix` dark-mode value was copied verbatim from `node_modules/tailwindcss/theme.css` (the installed package's own default palette), not retyped from memory or approximated — transcription errors are checkable by diffing against that file. The `color-mix()` values are the only computed (non-literal-copy) values, and are exactly the ones called out for extra scrutiny in Risks above.
- **Objection: "What if a component not in this audit's 14-file survey also has this duplication, and this change misses it?"**
  Mitigation: out of scope for this change by design — the proposal's Impact section names exactly the 9 components found in the audit. A repo-wide grep for the same raw-gray patterns after this change lands (part of `tasks.md`'s verification step) will catch any the audit missed, and any found are a follow-up, not scope creep into this change.

## Migration Plan

1. Add the new tokens to `src/styles/global.css`'s `@theme` block (declarations) and `:root`/`.dark` blocks (values), per the tables in Decisions 2 and 4.
2. Migrate the 9 components one at a time (order doesn't matter — each token is additive and doesn't remove anything until all call sites are moved), running `bun run lint` after each to catch stray unused-import or class-name typos early.
3. After all components are migrated, grep `src/components/ui` for the raw patterns this change replaces (`text-gray-[0-9]+ dark:text-gray-[0-9]+`, `border-gray-[0-9]+ dark:border-gray-[0-9]+`, `bg-(red|blue|emerald|yellow)-`) to confirm none remain outside the two explicitly-deferred sites (Decision 5).
4. Run the full CI gate (`bun run lint`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e`).
5. Start the dev server, screenshot `2024-05-20_tech-demo` in light and dark mode (same method as this session's baseline capture), and visually diff against the pre-change baseline screenshots.
6. No rollback machinery needed beyond normal `git revert` — this is a pure CSS/class-name change with no data migration or external dependency.

## Open Questions

None outstanding — all token names, values, and consolidation calls are decided above. Any raw-gray occurrence found outside the audited 14 files (see Adversarial review, last bullet) is explicitly deferred to a follow-up, not an open question blocking this change.
