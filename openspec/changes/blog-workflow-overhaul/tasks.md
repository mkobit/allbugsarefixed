<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=blog-workflow-overhaul
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Beads lifecycle formula

- [ ] 1.1 Write `.beads/formulas/blog-lifecycle.formula.toml`: 5 steps (`seed`, `researching`, `drafting`, `review`, `published`), vars `slug`/`title`, each step after `seed` explicitly chained to the previous via `after_step`/`depends_on`. `researching` step's description carries the notebook-vs-prose guardrail (fact/link/quote capture only, no blog-voice prose, code/data goes in auxiliary files not `notebook.md`).
- [ ] 1.2 Verify chaining for real: pour a throwaway test instance, confirm sequential blocking with `bd mol show --parallel` (closing `seed` unblocks `researching` and nothing else is simultaneously ready), then delete the test pour. Do not rely on `--dry-run` — it has no dependency info.

## 2. Migrate existing post frontmatter

- [ ] 2.1 `src/content/blog/2026-01-13_the-hidden-costs-of-flexible-time-off/index.mdx`: `status: "concept"` → `draft: true`
- [ ] 2.2 `src/content/blog/2024-01-01_measuring-commute-cost/index.mdx`: add `draft: false` (currently has no `status` field, implicitly published)
- [ ] 2.3 `src/content/blog/2024-05-20_tech-demo/index.mdx`: add `draft: false` (currently has no `status` field, implicitly published)

## 3. Schema and consumer sites

- [ ] 3.1 `src/content.config.ts`: replace `status` enum field with `draft: z.boolean()` (no default — required field)
- [ ] 3.2 `src/layouts/Layout.astro`: search index filter `data.status === 'published'` → `!data.draft`
- [ ] 3.3 `src/pages/blog/[...slug].astro`: prod static-path gate (`status === 'published' || status === 'locked'`) → `!draft`; collapse the per-status badge to a single "Draft" indicator shown only when `draft === true`
- [ ] 3.4 `src/pages/blog/index.astro`: listing filter → `!post.data.draft`
- [ ] 3.5 `src/pages/index.astro`: listing filter → `!post.data.draft`

## 4. Backfill molecules for pre-existing notebook-only folders

- [ ] 4.1 For each of the 6 folders with `notebook.md` but no `index.mdx` and no bead (everything under `src/content/blog/` except the 3 in Group 2), check for an existing `blog`-labeled bead by slug first, then pour `blog-lifecycle` and close its `seed` bead immediately (research has already started, so leave the molecule sitting at `stage:researching`)

## 5. Notebook template rework

- [ ] 5.1 `scripts/new-idea.ts`: replace the `## Idea` / `## References` template with headers that separate raw links/quotes, the human's own rough notes, and agent-research findings — no heading that reads as "write the post here"

## 6. AGENTS.md rewrite

- [ ] 6.1 `src/content/blog/AGENTS.md`: rewrite the "Workflow & lifecycle" section to describe the `blog-lifecycle` molecule flow (capture via pour with pre-pour idempotency check, advancing a stage by closing the current stage's bead, publishing by flipping `draft: false` and closing the `published` bead) instead of the `status`-driven flow
- [ ] 6.2 `src/content/blog/AGENTS.md`: strengthen the Persona section with explicit DO/DON'T examples distinguishing `notebook.md` scratch capture (facts, links, quotes, rough notes) from `index.mdx` human-written prose, and stating that code/data belongs in auxiliary files (`data.csv`, `map.ts`), not inline in `notebook.md`

## 7. Verification

- [ ] 7.1 Run the full CI gate locally per `AGENTS.md`: `bun lint`, `bun openspec:validate`, `bun typecheck`, `bun test`, `bun coverage`, `bun build`, `bun test:e2e` — fix any failures before merge
- [ ] 7.2 Start the dev server and manually confirm: all 3 existing posts render with correct visibility (2 published, 1 draft-only-in-dev), blog listing pages show the expected set, and the `[...slug].astro` Draft badge appears only on the draft post
