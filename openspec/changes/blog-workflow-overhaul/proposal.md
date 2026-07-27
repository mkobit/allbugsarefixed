## Why

The current staged/in-progress blog workflow (`YYYY-MM-DD_slug/notebook.md` → `index.mdx` with a 5-value `status` frontmatter enum, documented in `src/content/blog/AGENTS.md`) is disliked by the repo owner enough to want it "entirely ripped out."
Research into the mechanics and prior art (see `research.md` in this change folder) surfaces plausible root causes: no dashboard of what's in flight across dozens of folders, a manually-flipped `status` field that's easy to forget, and no cheap capture step for a fleeting idea.
Beads is already being adopted in this repo as the planning/tracking system; this proposal reuses it instead of inventing new content-status machinery.

## What Changes

- Replace the 5-value `status: concept|draft|review|published|locked` frontmatter enum with a single `draft: boolean` build-visibility switch.
- Move planning/lifecycle state (concept → researching → drafting → review → published) out of frontmatter and into `bd` issues, one per post idea, using a label convention (e.g. `blog`, `stage:seed|researching|drafting`).
- Capture of a new idea becomes `bd q "post idea: ..."` (no folder yet) instead of requiring a folder + `notebook.md` from the first thought.
- The existing `YYYY-MM-DD_slug/` folder + `notebook.md`-then-`index.mdx` shape is otherwise **kept** (co-located assets and the Astro content-collection loader already depend on it) — this is a state-tracking change, not a file-structure rewrite.
- `bd query`/`bd list -l blog` becomes the backlog dashboard; no new tooling is introduced.

## Capabilities

### New capabilities

- `blog-planning-via-beads`: post ideas are tracked as `bd` issues with a `blog`/`stage:*` label convention; the bead, not frontmatter, is the source of truth for lifecycle state.

### Modified capabilities

- None yet. `src/content/blog/AGENTS.md` and `src/content.config.ts`'s `status` field are not tracked as an OpenSpec capability today, so the frontmatter shrink to `draft: boolean` is scoped as an implementation detail of `blog-planning-via-beads` (see tasks, once written) rather than a formal delta.

## Impact

- `src/content.config.ts`: `status` enum field replaced with `draft: boolean`.
- `src/content/blog/AGENTS.md`: workflow & lifecycle section rewritten to describe the bead-driven capture/stage flow instead of the notebook/mdx status flow.
- Existing published posts: `status: published` → `draft: false` (mechanical migration across all existing `index.mdx` frontmatter).
- Any code reading `status` (list/filter views, RSS, etc. — needs a repo-wide grep before implementation) must switch to reading `draft`.
- No new external dependency; reuses `bd`, already being adopted.
