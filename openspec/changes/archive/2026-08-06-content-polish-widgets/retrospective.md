# Retrospective: content-polish-widgets

## §0 Evidence

- **Commit range**: `f21d92f..104aeec` on `design/k7d1-content-polish-widgets` (1 design-docs commit, 6 implementation commits across two parallel worktree branches, 2 merge commits).
- **Beads closed**: `bd query "label=meta:openspec:content-polish-widgets AND status=closed"` → 9/9 (`abf-k7d.1.1` through `abf-k7d.1.9`), plus the parent epic `abf-k7d.1` closed.
- **Test/lint/build status**: full CI gate run on the merged branch, all 8 required commands green — `bun scripts/verify-versions.mjs`, `bun run lint` (0 errors/warnings), `bun run openspec:validate` (3/3 passed), `bun run typecheck` (0 errors, pre-existing unrelated `z` deprecation hints only), `bun run test` (18 passed), `bun run coverage` (92.3% stmts / 100% funcs), `bun run build` (5 pages), `bun run test:e2e` (3 passed).

## §1 Wins

- The audit-before-design step (delegated to an `Explore` subagent) caught that the epic's own framing was half wrong before any code was written: TOC already worked, callouts already worked, images were greenfield rather than a gap — narrowing 4 candidate widgets down to 2 real ones (footnotes, TOC scroll-spy) and splitting the genuinely different-shaped image work into its own epic (`abf-k7d.5`) instead of cramming it into this design.
- Footnotes ended up not needing this repo's usual remark-plugin-to-JSX-component pattern at all — `mdast-util-to-hast`'s built-in GFM footnote handling produces correct, accessible HTML for free. Recognizing that saved a whole component (and its tests) that the epic's original "extend the shortcode pattern" framing would have implied was needed.
- Splitting footnotes and TOC scroll-spy into two dependency-independent bead chains (confirmed file-disjoint during design) let two subagents implement in parallel, isolated git worktrees, with zero merge conflicts when both landed back on the design branch.
- `modern-web-guidance` was checked before any client-side JS design work, per this repo's `AGENTS.md` mandate, and it changed the actual technical decision: the closest-matching guide's primary mechanism (`scrollsnapchange`) was rejected because it would have forced CSS scroll-snap onto article prose, and its own documented `IntersectionObserver` fallback was used directly instead.

## §2 Misses

- Both delegated worktree agents started from plain `main` instead of the `design/k7d1-content-polish-widgets` branch they were briefed to branch from, and had to self-correct by fast-forward merging the design-docs commit before starting. Worth stating the exact base branch/commit more explicitly in the agent prompt next time, not just the branch name.
- The footnote agent's own report noted a `git add -A` silently dropping an already-staged deletion once (caught via `git status` before committing, no bad commit resulted) — a minor process wobble, not a defect in the shipped code.

## §3 Surprises

- The TOC agent's worktree had an incomplete `node_modules` (missing `@astrojs/react` entirely), silently breaking all React island hydration until `bun install` was re-run in that worktree. Not a bug in this change, but a reminder that a freshly created worktree isn't guaranteed to inherit a fully-installed `node_modules` — agents should verify hydration actually works (not just that `typecheck`/`lint` pass) before trusting a "looks done" React-island task.
- `openspec-sync`'s labels-templating bug (`abf-2cq`, filed 2026-08-03) reproduced exactly the same way a second time on this change — `meta:openspec:{{change_name}}` left unsubstituted on the "Expand Tasks" bead. Confirms it's a real, reproducible formula-engine limitation (not a one-off), and the by-hand workaround (correctly labeling each child bead at creation time) is now proven twice, not just once.

## §4 Promote

- [ ] File a beads-flow issue to make the by-hand "expand tasks -> child beads with correct label" workaround the *documented* default procedure in `AGENTS.md`/the schema's `tasks` instruction, rather than something every session has to rediscover via `abf-2cq`, until `abf-2cq` itself is actually fixed.
- [ ] File a beads-flow issue to add "verify hydration actually runs, not just that typecheck/lint pass" as an explicit validation step for any future React-island task delegated to a subagent worktree, given the silently-broken `node_modules` incident above.
