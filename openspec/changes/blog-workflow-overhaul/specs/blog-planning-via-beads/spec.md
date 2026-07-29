## ADDED Requirements

### Requirement: Post ideas are captured by pouring a beads lifecycle molecule
A new blog post idea SHALL be captured by pouring the `blog-lifecycle` beads formula before any file is created, so a fleeting idea costs one command instead of a folder and a notebook file.

#### Scenario: Capturing a fleeting idea
- **WHEN** the user has a post idea and no research has started yet
- **THEN** `bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="..."` creates a root epic labeled `blog` plus one child bead per lifecycle stage (`stage:seed`, `stage:researching`, `stage:drafting`, `stage:review`, `stage:published`), each stage after `seed` explicitly blocked on the previous via `after_step`/`depends_on`, and no `src/content/blog/` folder is created yet

#### Scenario: Avoiding a duplicate pour
- **WHEN** an agent or the user is about to capture an idea
- **THEN** it checks for an existing `blog`-labeled bead matching the intended slug (e.g. `bd search <slug>`) before pouring `blog-lifecycle`, so the same idea doesn't end up with two competing molecules

### Requirement: Beads issues are the source of truth for planning state
Lifecycle state (seed → researching → drafting → review → published) SHALL live on the `blog-lifecycle` molecule's child beads, not in post frontmatter. Advancing a stage means closing the current stage's bead, which unblocks the next stage's bead in the chain — giving each transition its own timestamped bead rather than a single label flip.

#### Scenario: Advancing a post to research
- **WHEN** an idea is promoted from capture to active research
- **THEN** the folder `YYYY-MM-DD_slug/notebook.md` is created as today, the `stage:seed` bead is closed, and the now-unblocked `stage:researching` bead is claimed with an external-ref link back to the folder slug

#### Scenario: Advancing a post to drafting
- **WHEN** the user is ready to start writing prose
- **THEN** `index.mdx` is created as today, the `stage:researching` bead is closed, and the now-unblocked `stage:drafting` bead is claimed

### Requirement: Research notebook capture is structurally separated from publish-ready prose
`notebook.md` SHALL remain a fact/link/quote/rough-note scratchpad; it SHALL NOT contain publish-ready prose written in the blog's voice. Code or data needed for research SHALL live in the existing auxiliary-file convention (`data.csv`, `map.ts`, etc.), not inline in `notebook.md`. Delegated agents (Jules and others) claiming a `stage:researching` bead SHALL follow this constraint, since it is the failure mode that motivated this change.

#### Scenario: An agent researches a topic
- **WHEN** an agent (delegated or interactive) is doing research for a `stage:researching` bead
- **THEN** it appends facts, links, quotes, and structured notes to `notebook.md`, and does not write long-form paragraphs attempting to sound like a finished blog post

#### Scenario: Research produces code or data
- **WHEN** research requires a script or a dataset to back a claim
- **THEN** the code/data is added as a separate auxiliary file in the post's folder (e.g. `data.csv`, `map.ts`), not pasted into `notebook.md`

### Requirement: Frontmatter only controls build visibility
Post frontmatter SHALL carry a single `draft: boolean` field for Astro build visibility, replacing the multi-value `status` enum; it SHALL NOT be the source of truth for planning/lifecycle state.

#### Scenario: Publishing a post
- **WHEN** a post is ready to publish
- **THEN** `draft` is flipped to `false` in `index.mdx` frontmatter, the `stage:review` bead is closed, and the now-unblocked `stage:published` bead is closed with `bd close <id> --reason "published"`

### Requirement: The backlog is queryable without new tooling
The set of in-flight post ideas SHALL be visible via `bd query`/`bd list` filtered on the `blog` label, without requiring a new dashboard tool.

#### Scenario: Checking what's in flight
- **WHEN** the user wants to see all active blog ideas
- **THEN** `bd list -l blog` (or an equivalent `bd query`) lists every open post idea's molecule, and `bd mol progress <id>` shows which stage each is at
