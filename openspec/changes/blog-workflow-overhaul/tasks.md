<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=blog-workflow-overhaul
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Beads lifecycle formula

- [x] 1.1 Write `.beads/formulas/blog-lifecycle.formula.toml`: 5 steps (`seed`, `researching`, `drafting`, `review`, `published`), vars `slug`/`title`, each step after `seed` explicitly chained to the previous via `depends_on` (`after_step` tested and found non-functional). `researching` step's description carries the notebook-vs-prose guardrail (fact/link/quote capture only, no blog-voice prose, code/data goes in auxiliary files not `notebook.md`).
- [x] 1.2 Verify chaining for real: pour a throwaway test instance, confirm sequential blocking with `bd mol show --parallel` (closing `seed` unblocks `researching` and nothing else is simultaneously ready), then delete the test pour. Do not rely on `--dry-run` — it has no dependency info.

## 2. Migrate existing post frontmatter

(Superseded mid-implementation: field changed from `draft: boolean` to `visibility: 'hidden' | 'unlisted' | 'visible'` after user feedback that a boolean collapses two genuinely independent visibility checks the code already has. See `design.md` Decision 4.)

- [x] 2.1 `src/content/blog/2026-01-13_the-hidden-costs-of-flexible-time-off/index.mdx`: `status: "concept"` → `visibility: "hidden"`
- [x] 2.2 `src/content/blog/2024-01-01_measuring-commute-cost/index.mdx`: add `visibility: "visible"` (currently has no `status` field, implicitly published)
- [x] 2.3 `src/content/blog/2024-05-20_tech-demo/index.mdx`: add `visibility: "visible"` (currently has no `status` field, implicitly published)

## 3. Schema and consumer sites

- [x] 3.1 `src/content.config.ts`: replace `status` enum field with `visibility: z.enum(['hidden', 'unlisted', 'visible'])` (no default — required field)
- [x] 3.2 `src/layouts/Layout.astro`: search index filter `data.status === 'published'` → `data.visibility === 'visible'`
- [x] 3.3 `src/pages/blog/[...slug].astro`: prod static-path gate (`status === 'published' || status === 'locked'`) → `visibility !== 'hidden'`; collapse the per-status badge to show the `visibility` value whenever it isn't `'visible'`
- [x] 3.4 `src/pages/blog/index.astro`: listing filter → `post.data.visibility === 'visible'`
- [x] 3.5 `src/pages/index.astro`: listing filter → `post.data.visibility === 'visible'`

## 4. Backfill molecules for pre-existing notebook-only folders

- [x] 4.1 For each folder with `notebook.md` but no `index.mdx` and no bead (everything under `src/content/blog/` except the 3 in Group 2 — enumerate fresh at execution time, don't hardcode a count), check for an existing `blog`-labeled bead by slug first, then pour `blog-lifecycle` and close its `seed` bead immediately (research has already started, so leave the molecule sitting at `stage:researching`)

## 5. Notebook template rework

- [x] 5.1 `scripts/new-idea.ts`: replace the `## Idea` / `## References` template with headers that separate raw links/quotes, the human's own rough notes, and agent-research findings — no heading that reads as "write the post here"

## 6. AGENTS.md rewrite

- [x] 6.1 `src/content/blog/AGENTS.md`: rewrite the "Workflow & lifecycle" section to describe the `blog-lifecycle` molecule flow (capture via pour with pre-pour idempotency check, advancing a stage by closing the current stage's bead, publishing by flipping `visibility: "visible"` and closing the `published` bead) instead of the `status`-driven flow
- [x] 6.2 `src/content/blog/AGENTS.md`: strengthen the Persona section with explicit DO/DON'T examples distinguishing `notebook.md` scratch capture (facts, links, quotes, rough notes) from `index.mdx` human-written prose, and stating that code/data belongs in auxiliary files (`data.csv`, `map.ts`), not inline in `notebook.md`

## 7. Verification

- [x] 7.1 Run the full CI gate locally per `AGENTS.md`: `bun run lint`, `bun run openspec:validate`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e` — fix any failures before merge. (Note: use `bun run <script>`, not bare `bun <script>` — `bun test`/`bun coverage` collide with Bun's own reserved subcommands and silently do the wrong thing.)
- [x] 7.2 Start the dev server and manually confirm: all 3 existing posts render with correct visibility (2 `visible`, 1 `hidden`-in-dev-only), blog listing pages show the expected set, and the `[...slug].astro` badge appears only on the non-`visible` post
