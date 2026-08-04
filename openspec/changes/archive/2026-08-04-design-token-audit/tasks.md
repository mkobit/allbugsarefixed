<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=design-token-audit
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Add new tokens to global.css

- [ ] 1.1 Add `--color-ui-text-muted`, `--color-ui-text-dim`, `--color-ui-border`, `--color-ui-border-strong`, `--color-ui-surface-hover` to the `@theme` block, with `:root` (light) and `.dark` values per `design.md` Decision 2's table (values copied verbatim from `node_modules/tailwindcss/theme.css`, not retyped).
  Validation: `bun run lint` passes; `grep -c` for each new token name in `global.css` shows exactly one `@theme` declaration plus one `:root` and one `.dark` value.
- [ ] 1.2 Add the 12 `--color-callout-<state>-{bg,border,text}` tokens to the same blocks per `design.md` Decision 4's table, including the `color-mix(in oklab, ...)` dark-mode `-bg` values.
  Validation: `bun run build` succeeds (catches malformed `color-mix()` syntax at build time via Lightning CSS/Tailwind's CSS parser).

## 2. Migrate components to tokens

- [ ] 2.1 `heading.tsx`: change base style from `text-gray-900 dark:text-brand-text` to `text-brand-text` (Decision 1).
- [ ] 2.2 `table.tsx`: cell text (`text-gray-900 dark:text-gray-100` → `text-brand-text`), head text (→ `text-ui-text-muted`), row/wrapper border (`border-gray-200 dark:border-gray-800` → `border-ui-border`), row hover (`hover:bg-gray-100/50 dark:hover:bg-gray-800/50` → `hover:bg-ui-surface-hover/50`), selected state (`bg-gray-100 dark:bg-gray-800` → `bg-ui-surface-hover`).
- [ ] 2.3 `button.tsx`: ghost + outline variants' text (`text-gray-900 dark:text-gray-100` → `text-brand-text`), outline border (`border-gray-300 dark:border-gray-700` → `border-ui-border-strong`), both variants' hover bg (`hover:bg-gray-100 dark:hover:bg-gray-800` → `hover:bg-ui-surface-hover`). Leave `focus:ring-gray-500` untouched (Decision 5, out of scope).
- [ ] 2.4 `text.tsx`: base + `muted` variant (`text-gray-500 dark:text-gray-400` → `text-ui-text-muted`), `dim` variant (`text-gray-300 dark:text-gray-700` → `text-ui-text-dim`).
- [ ] 2.5 `time.tsx`: base + `muted` variant (`text-gray-500 dark:text-gray-400` → `text-ui-text-muted`).
- [ ] 2.6 `PostMetadata.tsx`: wrapper `text-gray-500 dark:text-gray-400` → `text-ui-text-muted`.
- [ ] 2.7 `separator.tsx`: `SlashSeparator`'s `text-gray-300 dark:text-gray-700` → `text-ui-text-dim`.
- [ ] 2.8 `link.tsx`: `default` variant's `text-gray-600 dark:text-gray-400` → `text-ui-text-muted` (accepted small light-mode delta, Decision 3).
- [ ] 2.9 `callout.tsx`: replace each state's `bg-*-50 dark:bg-*-900/20 border-*-200 dark:border-*-800 text-*-800 dark:text-*-200` with `bg-callout-<state>-bg border-callout-<state>-border text-callout-<state>-text` (no `dark:` prefixes needed — the tokens already resolve per mode).
  Validation for 2.1-2.9: `bun run lint` and `bun run typecheck` pass after each file; `rg 'gray-[0-9]|bg-(red|blue|emerald|yellow)-' src/components/ui/<file>` returns nothing for the lines touched (except the two Decision-5 exclusions).

## 3. Repo-wide sweep and CI verification

- [ ] 3.1 Grep `src/components/ui` for the migrated raw patterns (`text-gray-[0-9]+ dark:text-gray-[0-9]+`, `border-gray-[0-9]+ dark:border-gray-[0-9]+`, `bg-(red|blue|emerald|yellow)-`) to confirm no occurrences remain outside `button.tsx`'s `focus:ring-gray-500`, `heading.tsx`'s anchor-link `text-gray-400`, and `ScrollProgress.tsx`'s 3 unmapped patterns (`bg-white dark:bg-gray-800`, `ring-gray-200 dark:ring-gray-700`, `text-gray-200 dark:text-gray-700`) — all Decision 5's explicit exclusions.
  Validation: grep output matches expectation exactly (known exclusions only, nothing else).
- [ ] 3.2 Run the full CI gate: `bun run lint`, `bun run openspec:validate`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e`.
  Validation: all seven commands exit 0.

## 4. Visual verification

- [ ] 4.1 Start `bun start`, screenshot `src/content/blog/2024-05-20_tech-demo/index.mdx` (full page) in both light and dark mode using the same Playwright method as this session's pre-change baseline.
  Validation: side-by-side comparison against the baseline screenshots shows no unintended color change — the only expected difference is `link.tsx`'s default-variant light-mode text (Decision 3) and any subtle shift in the 4 callout blocks' dark-mode backgrounds (Decision 4, `color-mix()` vs. opacity-modifier rendering).
- [ ] 4.2 If the callout dark-mode `color-mix()` backgrounds look visibly off compared to the baseline (beyond the expected mixing-technique delta noted in `design.md` Risks), fall back to keeping the `/20` opacity-modifier pattern for callout backgrounds specifically, dropping only the border/text tokens' consolidation for that state.
  Validation: re-screenshot and re-compare; note the fallback decision in `retrospective.md` if triggered.
