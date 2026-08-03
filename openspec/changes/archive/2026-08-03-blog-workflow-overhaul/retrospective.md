# Retrospective: blog-workflow-overhaul

## §0 Evidence

- **Commit range**: `d8a1581^..3db0dd8` (#267 → #291, 21 commits), verified via `git log --oneline`.
- **Beads closed**: `abf-zdv.4` (epic, external ref `openspec:blog-workflow-overhaul`, closed 2026-08-03, "18/18 children complete"), `abf-zdv.4.17` (decision: single-file purge-on-publish), `abf-zdv.4.18` + children `.1`-`.5` (single-file mechanism build-out, PRs #280-286).
- **Test/lint/build status** (re-run 2026-08-03 as part of archiving): `bun run lint` 0 errors/0 warnings, `bun run typecheck` 0 errors (pre-existing unrelated `z` deprecation hints only), `bun run test` 18/18 passed, `bun run coverage` 92.3% stmt / 86.95% branch / 100% funcs, `bun run build` succeeds, `bun run test:e2e` 3/3 passed.

## §1 Wins

- Reused `bd` (already being adopted in-repo) instead of inventing new content-status machinery — no new tracking tool, `bd query`/`bd list -l blog` became the backlog dashboard as planned.
- Both mid-flight redesigns (`draft: boolean` → `visibility` enum; two-file `notebook.md`+`index.mdx` → single-file with purge-on-publish `## Scratch`) were caught by adversarial review / explicit user pushback *before* they shipped wrong, not after — the decision beads (`abf-zdv.4.17` and the earlier visibility-field one) record the rejected alternatives and why.
- The single-file mechanism has direct unit coverage at the exact boundary-parsing logic that's hardest to get right: `scratch-section.test.ts` and `remark-strip-scratch.test.ts` cover fenced-code-block false positives and formatted (`## **Scratch**`) headings, not just the happy path.

## §2 Misses

- `tasks.md` items 8-12 were never checked off after the underlying work shipped and closed as `abf-zdv.4.18` (closed 2026-08-02) — the openspec change sat "complete in beads, stale on disk" for about a day, and was never archived until this pass (2026-08-03) caught it.
- `openspec/specs/` didn't exist at all; the delta spec at `specs/blog-planning-via-beads/spec.md` had never been synced into a first-class capability spec despite the change being fully implemented and closed.
- The retrospective instruction's evidence step assumes closed work carries a `meta:openspec:<change-name>` label queryable via `bd query`; nothing in this change was labeled that way (`scope:blog` / `meta:beads-flow` were used instead), so that query returned empty and this retrospective had to fall back to `git log` + direct `bd show` lookups.

## §3 Surprises

- All 9 pre-existing `notebook.md`-only folders had already been fully migrated by the time this retrospective ran (task 11) — zero leftover `notebook.md` anywhere in `src/content/blog`, no cleanup work waiting.
- Dry-running `purge-scratch`'s underlying logic against a real hidden post (`2026-01-13_the-hidden-costs-of-flexible-time-off`, copied to a scratch dir rather than run destructively in place) cleanly isolated the `## Scratch` section from real frontmatter/body on the first try (4403 of 5055 bytes removed, remaining content untouched) — no manual fixup needed.

## §4 Promote

- [ ] Standardize a bead label applied at pour/hydrate time (e.g. `meta:openspec:<change-name>`) so retrospective evidence-gathering can actually find the closed work via `bd query` instead of falling back to manual `git log`/`bd show` archaeology.
- [ ] Add "reconcile `tasks.md` checkboxes + archive" as an explicit step when an openspec-tracked epic closes, so completed changes don't sit unarchived for days with stale checkboxes.
