# Retrospective: design-token-audit

## §0 Evidence

- **Commit range**: uncommitted at time of writing, branch `design/k7d3-token-audit` off `main` (`3db0dd8`/`15f7668`).
- **Beads closed**: `abf-k7d.3.1` through `abf-k7d.3.15` (15 tasks under epic `abf-k7d.3`), all closed 2026-08-04. `abf-k7d.3.16` (ScrollProgress.tsx migration) filed open as a deliberate follow-up, not closed.
- **Test/lint/build status**: `bun run lint` 0 errors/warnings, `bun run openspec:validate` 2/2, `bun run typecheck` 0 errors (pre-existing unrelated `z` deprecation hints only), `bun run test` 18/18, `bun run coverage` 92.3% stmt, `bun run build` succeeds, `bun run test:e2e` 3/3.

## §1 Wins

- Every new token's light-mode (and non-`color-mix` dark-mode) value was copied verbatim from the installed `tailwindcss@4.3.3` package's own `theme.css`, not retyped from memory — this made the "preserve current colors" requirement mechanically checkable rather than a judgment call.
- The `color-mix(in oklab, ...)` technique for dark-mode callout backgrounds (replacing a per-usage `/20` opacity modifier with a value computed once at token-definition time) held up under real visual verification — before/after screenshots of all 4 callout states in dark mode were visually indistinguishable from the pre-change baseline.
- The design's own sweep task (3.1) caught a real inconsistency in this session's own artifacts: `proposal.md` had listed `ScrollProgress.tsx` as in-scope, but `design.md`/`tasks.md` silently dropped it. The sweep step existed specifically to catch this kind of drift, and it worked on the first real change it was applied to.

## §2 Misses

- The `ScrollProgress.tsx` drop should have been caught earlier — ideally when writing `design.md`, by re-reading `proposal.md`'s component list against the Decisions section, rather than relying on a later grep-based sweep to catch it. The sweep is a good safety net but shouldn't be the primary check for proposal/design consistency.
- The `openspec-sync` formula's `expand-tasks` step has a real bug: `labels = [..., "meta:openspec:{{change_name}}"]` doesn't get template-substituted (the literal string `{{change_name}}` ends up in the label), even though the same step's `title` field substitutes correctly. This wasn't caught until this session actually poured the formula and inspected the resulting bead — filed as `abf-2cq` (which was previously filed on a wrong premise from the prior session's retrospective; corrected here).

## §3 Surprises

- `heading.tsx`'s base style (`text-gray-900 dark:text-brand-text`) was already half-migrated to the token system — only the dark side used `--color-brand-text`, the light side still used raw `gray-900`. This meant one of the 9 component migrations required zero new tokens at all, just fixing an existing inconsistency.
- The `bd query`/`bd list` default-to-open-only status filtering (discovered while trying to verify the formula bug) had silently invalidated a whole paragraph of the *previous* change's retrospective (`blog-workflow-overhaul`) — the claim "nothing was labeled that way" was wrong; the label was there, the query just excluded closed issues by default. Recorded via `bd remember` so it doesn't recur.

## §4 Promote

- [ ] When writing `design.md`, explicitly re-check its Decisions/exclusions against `proposal.md`'s stated component/file list line-by-line, rather than relying solely on a later automated sweep to catch scope drift between the two documents.
- [ ] Before concluding a bead/label "doesn't exist" via `bd query`/`bd list`, always pass `--status=closed` (or check across statuses) first — see the `bd-query-list-default-open-only-status-filter` memory.
