# Backlog pruner

Goal: clean up the beads backlog so `bd ready` reflects only actionable, current work.
Scope: read and close/defer existing issues only. Do not create new issues. Do not touch source code or openspec files.

## Steps

1. Run `bd stats` to get an overview of the database.

2. Run `bd stale` to find issues not updated recently.
   For each stale issue: read it with `bd show <id>`.
   If it is blocked indefinitely, superseded, or no longer relevant, close it:
   `bd close <id> --reason "<why>"`
   If it is still valid but not urgent, defer it:
   `bd defer <id> --until "<date>"`

3. Run `bd duplicates` (or `bd find-duplicates` for a text/AI similarity pass) and resolve any duplicates found:
   `bd duplicate <duplicate-id> <canonical-id>`

4. Run `bd list --status=open` and scan for issues that are vague, untitled, or have no description.
   Close these with reason "too vague to action", or improve them with:
   `bd update <id> --title "..."` and/or `bd update <id> --description "..."`

5. Run `bd ready` at the end to confirm the remaining backlog is clean and unblocked.

## Constraints

- Do not open new issues.
- Do not modify any files outside `.beads/`.
- Do not use `bd edit` — it opens `$EDITOR` and blocks a non-interactive session.
- Do not run `bd dolt push` — leave that for the maintainer.
- One session only: stop after completing the steps above.
