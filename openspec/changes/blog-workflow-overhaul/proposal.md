## Why

The current staged/in-progress blog workflow (`YYYY-MM-DD_slug/notebook.md` → `index.mdx` with a 5-value `status` frontmatter enum, documented in `src/content/blog/AGENTS.md`) is disliked by the repo owner enough to want it "entirely ripped out."
Research into the mechanics and prior art (see `research.md` in this change folder) surfaces plausible root causes: no dashboard of what's in flight across dozens of folders, a manually-flipped `status` field that's easy to forget, and no cheap capture step for a fleeting idea.
A second, distinct problem surfaced during review: `notebook.md` is meant to be a research scratchpad (links, facts, agent-research findings, the human's own rough notes), but delegated agents (Jules and others) have repeatedly turned it into agent-written prose that leaks into the eventual post's voice, and have committed stray code into it that doesn't belong there. The repo owner wants the blog's actual prose to stay human-written, with the notebook as pure feeder material.
Beads is already being adopted in this repo as the planning/tracking system; this proposal reuses it instead of inventing new content-status machinery.

## What Changes

- Replace the 5-value `status: concept|draft|review|published|locked` frontmatter enum with a 3-value `visibility: hidden|unlisted|visible` build-visibility field, scoped only to what Astro needs at build time (not the old enum's mix of build-visibility and lifecycle-stage concerns), with **no schema default** — every post must set it explicitly. (An earlier draft of this proposal used a `draft: boolean` with a silent default; both were wrong — a boolean collapses two genuinely independent visibility checks the code already has, and the silent default assumed "only one post exists," which was false. See Impact below and `design.md` Decision 4.)
- Move planning/lifecycle state (seed → researching → drafting → review → published) out of frontmatter and into `bd` issues via a new **beads molecule formula** (`blog-lifecycle`), one pour per post idea: a root epic plus one child issue per lifecycle stage, sequentially chained. This gives per-transition timestamps/audit trail for free (each stage is its own bead) without hand-rolling a child-bead-per-transition scheme.
- Capture of a new idea becomes `bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="..."` (no folder yet) instead of requiring a folder + `notebook.md` from the first thought.
- The existing `YYYY-MM-DD_slug/` folder shape is **kept** (co-located assets and the Astro content-collection loader already depend on it) — this is primarily a state-tracking change, not a file-structure rewrite.
- **Superseded by a follow-on decision (`abf-zdv.4.17`/`abf-zdv.4.18`), see `design.md` Decisions 5–7:** the `notebook.md`-then-`index.mdx` two-file split, originally kept as-is by this proposal, was revisited mid-implementation and replaced with a single `index.mdx` per post containing a reserved `## Scratch` section, stripped at render time and purged (deleted) from the file at the `review`→`published` transition. The two-file split below (this bullet and the next) describes what this change *originally* shipped; Decisions 5–7 describe what supersedes it.
- `notebook.md`'s template (`scripts/new-idea.ts`) and `src/content/blog/AGENTS.md`'s persona section are reworked to structurally discourage prose/code creep: the notebook stays fact/link/quote capture only, code or data needed for research goes in the existing auxiliary-file convention (`data.csv`, `map.ts`, etc.), and blog prose is written by the human in `index.mdx` only. (Superseded per above: this becomes "the `## Scratch` section stays fact/link/quote capture only... blog prose is written outside `## Scratch`.")
- `bd query`/`bd list -l blog` becomes the backlog dashboard; no new tooling is introduced.

## Capabilities

### New capabilities

- `blog-planning-via-beads`: post ideas are tracked via a `blog-lifecycle` beads molecule (one pour per idea, one child bead per stage); the molecule, not frontmatter, is the source of truth for lifecycle state. Includes the notebook-vs-prose separation requirements (template shape, code/data placement) since both are part of making beads-driven planning replace the old status-driven workflow.

### Modified capabilities

- None yet. `src/content/blog/AGENTS.md` and `src/content.config.ts`'s `status` field are not tracked as an OpenSpec capability today, so the frontmatter shrink to `visibility: hidden|unlisted|visible` is scoped as an implementation detail of `blog-planning-via-beads` (see tasks, once written) rather than a formal delta.

## Impact

- `src/content.config.ts`: `status` enum field replaced with `visibility: z.enum(['hidden', 'unlisted', 'visible'])`.
- `src/content/blog/AGENTS.md`: workflow & lifecycle section rewritten to describe the bead-driven capture/stage flow instead of the notebook/mdx status flow; persona section gets explicit notebook-vs-prose examples.
- `scripts/new-idea.ts`: notebook template reworked from the current open-ended `## Idea` / `## References` shape to headers that don't invite paragraph prose.
- `.beads/formulas/blog-lifecycle.formula.toml`: new formula defining the seed → researching → drafting → review → published step chain.
- Repo-wide grep confirmed 4 non-schema call sites reading `status` (no RSS/feed file exists): `src/layouts/Layout.astro` (search index), `src/pages/blog/[...slug].astro` (prod static-path gate + a status badge), `src/pages/blog/index.astro` and `src/pages/index.astro` (listing filters). All switch to reading `visibility`: the static-path gate checks `visibility !== 'hidden'`, search/listing filters check `visibility === 'visible'`; the badge in `[...slug].astro` shows the `visibility` value whenever it isn't `'visible'`.
- Existing content: as of this writing, only 3 folders have `index.mdx` (`2026-01-13_the-hidden-costs-of-flexible-time-off` with `status: "concept"` → `visibility: "hidden"`; `2024-01-01_measuring-commute-cost` and `2024-05-20_tech-demo` with **no `status` field**, implicitly published today via the schema default → `visibility: "visible"`). No posts currently use `review` or `locked`, and none use the new `unlisted` state yet either — it's a capability being added, not migrated content. Every other folder is notebook-only with no `index.mdx` and no bead — backfilled with a `blog-lifecycle` molecule as part of migration (see `design.md`), enumerated fresh at execution time rather than as a fixed list here.
- No new external dependency; reuses `bd`, already being adopted.
- **Single-file-per-post mechanism (`abf-zdv.4.18`, `design.md` Decisions 5–7), additive impact on top of the above:**
  - `src/lib/remark/remark-strip-scratch.ts`: new remark plugin, registered in `astro.config.mjs`'s two remark-plugin lists, strips the `## Scratch` section from every render.
  - `scripts/purge-scratch.ts`: new script (`bun run purge-scratch <slug>`) that deletes the `## Scratch` section's lines from a post's `index.mdx` at publish time.
  - `scripts/new-idea.ts`: creates `index.mdx` with a `## Scratch` section instead of a separate `notebook.md`.
  - `src/content.config.ts`: the `!**/notebook.md` glob exclude is removed (no longer meaningful).
  - `src/content/blog/AGENTS.md`: Structure/Files/Workflow sections rewritten for the single-file shape (see `design.md` Migration Plan for `abf-zdv.4.18`).
  - Existing notebook-only folders (the `abf-mol-*` backfilled molecules) are migrated: `notebook.md` merged into a new `index.mdx` under `## Scratch`, then deleted.
