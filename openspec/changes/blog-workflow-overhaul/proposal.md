## Why

The current staged/in-progress blog workflow (`YYYY-MM-DD_slug/notebook.md` → `index.mdx` with a 5-value `status` frontmatter enum, documented in `src/content/blog/AGENTS.md`) is disliked by the repo owner enough to want it "entirely ripped out."
Research into the mechanics and prior art (see `research.md` in this change folder) surfaces plausible root causes: no dashboard of what's in flight across dozens of folders, a manually-flipped `status` field that's easy to forget, and no cheap capture step for a fleeting idea.
A second, distinct problem surfaced during review: `notebook.md` is meant to be a research scratchpad (links, facts, agent-research findings, the human's own rough notes), but delegated agents (Jules and others) have repeatedly turned it into agent-written prose that leaks into the eventual post's voice, and have committed stray code into it that doesn't belong there. The repo owner wants the blog's actual prose to stay human-written, with the notebook as pure feeder material.
Beads is already being adopted in this repo as the planning/tracking system; this proposal reuses it instead of inventing new content-status machinery.

## What Changes

- Replace the 5-value `status: concept|draft|review|published|locked` frontmatter enum with a single `draft: boolean` build-visibility switch with **no schema default** — every post must set it explicitly. (An earlier draft of this proposal assumed a `default(true)` was safe because "only one post exists"; that was wrong — see Impact below — so the field is required instead.)
- Move planning/lifecycle state (seed → researching → drafting → review → published) out of frontmatter and into `bd` issues via a new **beads molecule formula** (`blog-lifecycle`), one pour per post idea: a root epic plus one child issue per lifecycle stage, sequentially chained. This gives per-transition timestamps/audit trail for free (each stage is its own bead) without hand-rolling a child-bead-per-transition scheme.
- Capture of a new idea becomes `bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="..."` (no folder yet) instead of requiring a folder + `notebook.md` from the first thought.
- The existing `YYYY-MM-DD_slug/` folder + `notebook.md`-then-`index.mdx` shape is otherwise **kept** (co-located assets and the Astro content-collection loader already depend on it) — this is a state-tracking change, not a file-structure rewrite.
- `notebook.md`'s template (`scripts/new-idea.ts`) and `src/content/blog/AGENTS.md`'s persona section are reworked to structurally discourage prose/code creep: the notebook stays fact/link/quote capture only, code or data needed for research goes in the existing auxiliary-file convention (`data.csv`, `map.ts`, etc.), and blog prose is written by the human in `index.mdx` only.
- `bd query`/`bd list -l blog` becomes the backlog dashboard; no new tooling is introduced.

## Capabilities

### New capabilities

- `blog-planning-via-beads`: post ideas are tracked via a `blog-lifecycle` beads molecule (one pour per idea, one child bead per stage); the molecule, not frontmatter, is the source of truth for lifecycle state. Includes the notebook-vs-prose separation requirements (template shape, code/data placement) since both are part of making beads-driven planning replace the old status-driven workflow.

### Modified capabilities

- None yet. `src/content/blog/AGENTS.md` and `src/content.config.ts`'s `status` field are not tracked as an OpenSpec capability today, so the frontmatter shrink to `draft: boolean` is scoped as an implementation detail of `blog-planning-via-beads` (see tasks, once written) rather than a formal delta.

## Impact

- `src/content.config.ts`: `status` enum field replaced with `draft: boolean`.
- `src/content/blog/AGENTS.md`: workflow & lifecycle section rewritten to describe the bead-driven capture/stage flow instead of the notebook/mdx status flow; persona section gets explicit notebook-vs-prose examples.
- `scripts/new-idea.ts`: notebook template reworked from the current open-ended `## Idea` / `## References` shape to headers that don't invite paragraph prose.
- `.beads/formulas/blog-lifecycle.formula.toml`: new formula defining the seed → researching → drafting → review → published step chain.
- Repo-wide grep confirmed 4 non-schema call sites reading `status` (no RSS/feed file exists): `src/layouts/Layout.astro` (search index), `src/pages/blog/[...slug].astro` (prod static-path gate + a status badge), `src/pages/blog/index.astro` and `src/pages/index.astro` (listing filters). All switch to reading `draft`; the per-status badge in `[...slug].astro` collapses to a single "Draft" badge shown only when `draft === true`.
- Existing content: 9 dated folders exist, but only 3 have `index.mdx` (`2026-01-13_the-hidden-costs-of-flexible-time-off` with `status: "concept"` → `draft: true`; `2024-01-01_measuring-commute-cost` and `2024-05-20_tech-demo` with **no `status` field**, implicitly published today via the schema default → `draft: false`). No posts currently use `review` or `locked`, so no precedent is lost in the collapse to boolean. The other 6 folders are notebook-only with no `index.mdx` and no bead — backfilled with a `blog-lifecycle` molecule as part of migration (see `design.md`).
- No new external dependency; reuses `bd`, already being adopted.
