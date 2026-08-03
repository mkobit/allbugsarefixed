# Reflection: blog-workflow-overhaul

## Process analysis

### Beads metadata

- **Turnaround time**: Fast for a personal-repo epic: proposal #267 (2026-07-27) through the single-file mechanism's final PR #286 (2026-08-02) is about a week including a full mid-flight redesign (two-file → single-file), followed by small fix/doc commits (#287-291) trickling in through 2026-08-03.
- **Label consistency**: Inconsistent for retrospective purposes. Beads used `scope:blog` / `meta:beads-flow`, not a change-scoped label, so there was no single `bd query` that returned "everything closed for this openspec change" — the retrospective had to cross-reference `git log` PR numbers against `bd show` lookups by hand. Filed `abf-2cq` to fix this going forward.
- **Bottlenecks**: The main bottleneck wasn't beads velocity, it was bookkeeping drift after work finished — `tasks.md` checkboxes for items 8-12 were never flipped after `abf-zdv.4.18` closed, and the change was never archived, so it looked "still open" on disk for about a day while beads already considered it done. Filed `abf-q7e` to fix this going forward.

### OpenSpec workflow

- **Design clarity**: Good. `design.md` Decisions 4-7 explicitly recorded both reversals (visibility enum, single-file) with the rejected alternatives and rationale, so implementation didn't have to re-litigate either decision mid-flight — the record was there to check against.
- **Task granularity**: Right-sized. Tasks 1-7 (original two-file beads-lifecycle work) and 8-12 (single-file mechanism, added later) each map cleanly to one bead-tree (the later set became `abf-zdv.4.18` + `.1`-`.5`), and each task item corresponds to a reviewable, independently verifiable unit (one file, one script, one migration pass).
- **Artifact friction**: The friction was entirely in the close-out artifacts, not the working ones — `retrospective.md` and `reflection.md` were never written even though `proposal.md`/`design.md`/`specs/`/`tasks.md` were all kept current during active implementation. The gap only surfaced because this session ran `openspec status --json` and saw `isComplete: false`.

## Follow-up actions

- **[ ] abf-2cq**: Label openspec-tracked beads with `meta:openspec:<change-name>` at hydrate time so retrospectives can query closed work directly instead of reconstructing it from `git log`.
- **[ ] abf-q7e**: Add "reconcile tasks.md + archive" as an explicit step when an openspec-tracked epic closes, so completed changes don't sit unarchived with stale checkboxes.
