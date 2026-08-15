## Context

The repository uses `bd` (beads) for issue tracking.
As platform features, testing pipelines, info structures, and authoring workflows ship, closed issues provide a history of work completed.
Rather than manually maintaining a changelog file, deriving changelog entries directly from closed beads history automates the process and guarantees accuracy.

## Goals / Non-Goals

**Goals:**
- Extract closed beads issues automatically via script into structured JSON data.
- Categorize entries into four distinct categories: info, platform, testing, and authoring-tooling.
- Render a static changelog page on the site at `/changelog`.
- Ensure synthetic sync/molecule tasks and human-authored blog post content entries are excluded.

**Non-Goals:**
- Include published blog post entries in the changelog (blog posts are content, not authoring platform capabilities).
- Build a real-time live database connection to `bd` in production (site remains statically generated).

## Decisions

### Decision 1: Build-time generation script producing static JSON
- Create `scripts/generate-changelog.ts` that executes `bd list --status closed --limit 0 --json`.
- Parse output and filter entries into `src/data/changelog.json`.
- Commit `src/data/changelog.json` to git so static site builds in CI succeed even if `bd` CLI binary is absent.

### Decision 2: Categorization heuristics
- **Info**: Issues labeled `type:info`, `meta:beads-flow`, or `meta:docs`.
- **Testing**: Issues labeled `type:test`, `meta:testing`, `ci`, or title containing test/coverage/CI.
- **Authoring tooling**: Issues labeled `meta:blog-flow`, `meta:authoring`, `type:tooling`, or related to drafting formulas.
- **Platform**: Issues with `meta:openspec:*`, `type:feature`, `type:task`, or default fallback platform tasks.
- **Exclusions**: Issues labeled `type:sync`, `type:blog-post`, `meta:content`, or titled "Expand Tasks".

### Decision 3: UI page architecture
- Astro page `src/pages/changelog.astro` acts as the routing glue.
- React UI component `src/components/ui/changelog-view.tsx` renders category filters, timeline cards, and badge indicators.

## Risks / Trade-offs

- [Risk: CI build environment lacks `bd` CLI] → Mitigation: Static `src/data/changelog.json` is committed to git and updated via pre-commit or pre-build script when `bd` is present.
- [Risk: Uncategorized or synthetic issues cluttering UI] → Mitigation: Strict exclusion filters for `type:sync` and title patterns like `Expand Tasks`, with fallback defaults for unmatched tasks.

## Adversarial review and mitigations

- **Failure mode: Noise from granular child task beads**
  - *Objection*: Hydrating OpenSpec tasks creates dozens of tiny sub-beads (e.g. "Add dependency to package.json") that flood the changelog.
  - *Mitigation*: Group entries by parent epic or molecule when available, or hide child tasks under expandable detail disclosures on the changelog page.

- **Failure mode: `bd --json` schema changes in v2.0**
  - *Objection*: `bd` emitted a notice that JSON output format will change in v2.0 envelope mode.
  - *Mitigation*: The parser script handles both array root JSON and envelope `{ "issues": [...] }` schema formats gracefully.

## Migration Plan

1. Implement `scripts/generate-changelog.ts` and test extraction against local `.beads` database.
2. Output generated data to `src/data/changelog.json`.
3. Create `src/components/ui/changelog-view.tsx` and `src/pages/changelog.astro`.
4. Add npm script `bun run changelog:generate` and integrate into build/CI scripts if desired.

## Open Questions

- None. Design decisions and scope boundaries are fully resolved.
