## ADDED Requirements

### Requirement: Post ideas are captured as beads issues
A new blog post idea SHALL be captured as a `bd` issue before any file is created, so a fleeting idea costs one command instead of a folder and a notebook file.

#### Scenario: Capturing a fleeting idea
- **WHEN** the user has a post idea and no research has started yet
- **THEN** a `bd` issue is created (e.g. `bd q "post idea: ..." -l blog,stage:seed`) and no `src/content/blog/` folder is created yet

### Requirement: Beads issues are the source of truth for planning state
Lifecycle state (concept → researching → drafting → review → published) SHALL live on the `bd` issue via labels, not in post frontmatter.

#### Scenario: Advancing a post to research
- **WHEN** an idea is promoted from capture to active research
- **THEN** the folder `YYYY-MM-DD_slug/notebook.md` is created as today, and the bead's label is updated to `stage:researching` with an external-ref link back to the folder slug

#### Scenario: Advancing a post to drafting
- **WHEN** the user is ready to start writing prose
- **THEN** `index.mdx` is created as today, and the bead's label is updated to `stage:drafting`

### Requirement: Frontmatter only controls build visibility
Post frontmatter SHALL carry a single `draft: boolean` field for Astro build visibility, replacing the multi-value `status` enum; it SHALL NOT be the source of truth for planning/lifecycle state.

#### Scenario: Publishing a post
- **WHEN** a post is ready to publish
- **THEN** `draft` is flipped to `false` in `index.mdx` frontmatter and the corresponding bead is closed with `bd close <id> --reason "published"`

### Requirement: The backlog is queryable without new tooling
The set of in-flight post ideas SHALL be visible via `bd query`/`bd list` filtered on the `blog` label, without requiring a new dashboard tool.

#### Scenario: Checking what's in flight
- **WHEN** the user wants to see all active blog ideas
- **THEN** `bd list -l blog` (or an equivalent `bd query`) lists every open post idea with its current `stage:*` label
