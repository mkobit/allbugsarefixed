# OpenSpec housekeeping

Goal: keep the openspec changes directory tidy. Archive completed changes and validate in-progress ones.
Scope: read and archive/validate existing openspec changes only. Do not propose new changes. Do not modify source code.

## Steps

1. Run `bun x openspec list` to see all current changes and their status.

2. For each change, run `bun x openspec change show <name>` to check which artifacts exist (proposal/specs/design/tasks/retrospective/reflection — this repo's `beads-driven` schema, see `openspec/schemas/beads-driven/schema.yaml`, expects all six before archiving).
   Cross-check against beads: `bd query "label=meta:openspec:<name>"` — if every linked issue is closed and `retrospective.md`/`reflection.md` exist, it's ready to archive:
   `bun x openspec archive <name>`

3. For each change still in progress:
   Run `bun x openspec validate <name> --no-interactive` to catch structural issues.
   If a change has been abandoned (no linked beads issues open, no recent git activity in its `openspec/changes/<name>/` folder), note it in a comment on the relevant beads issue but do not archive without confirmation.

4. Run `bun x openspec list` again at the end to confirm the directory is clean.

## Constraints

- Do not run `bun x openspec change validate` in create mode or otherwise propose anything new.
- Do not modify source code files.
- Do not close or create beads issues.
- One session only: stop after completing the steps above.
