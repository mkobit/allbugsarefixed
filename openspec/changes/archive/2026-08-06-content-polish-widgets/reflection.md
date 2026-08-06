# Reflection: content-polish-widgets

## Process analysis

### Beads metadata

- **Turnaround time**: proposal-to-close was a single continuous session. All 9 task beads went claim → close within their subagent's run; the two independent chains (footnotes, TOC) ran concurrently rather than serially, so wall-clock time tracked the slower of the two chains, not their sum.
- **Label consistency**: `openspec-sync`'s formula-level label templating failed again (`meta:openspec:{{change_name}}` left unsubstituted) — this is the second confirmed reproduction of `abf-2cq`, worked around by hand-labeling all 9 children at creation time. Once labeled correctly, `bd query "label=meta:openspec:content-polish-widgets AND status=closed"` found all 9 cleanly.
- **Bottlenecks**: none structural. The dependency graph (group 1 -> group 1 tasks sequential, group 2 -> group 2 sequential, group 1 and group 2 mutually independent, group 3 gated on both) matched the actual file-level independence discovered during design, so no bead sat blocked waiting on unrelated work.

### OpenSpec workflow

- **Design clarity**: both subagents executed their full 4-task chains without needing to ask a clarifying question back — the design.md Decisions sections (remark-gfm rationale, the exact IntersectionObserver algorithm, the `client:visible` choice) were concrete enough to implement directly rather than re-decide mid-implementation. That's the intended outcome of front-loading decisions into design.md instead of leaving them as open questions.
- **Task granularity**: the 4-tasks-per-capability split (dependency, wiring, styling, verification / port, behavior, hydration, fallback-check) mapped cleanly to one bead-close-plus-commit per task, matching this repo's established granularity from `design-token-audit`'s 15-task expansion. No task needed splitting further or merging together during implementation.
- **Artifact friction**: the audit-first step (delegated to an `Explore` subagent before any OpenSpec artifact was written) meant the proposal's Capabilities section was correct on the first pass — no proposal/design rework was needed after the fact, unlike the `abf-k7d.3.16`/`ScrollProgress` correction that happened mid-change in the prior audit.

## Follow-up actions

- **[ ] abf-7gk**: Document the by-hand `openspec-sync` labels workaround as the default procedure in `AGENTS.md` (or the formula's own description), cross-referencing `abf-2cq`, instead of leaving it to be rediscovered each time the bug reproduces.
- **[ ] abf-6c5**: Require an explicit runtime-hydration validation step (not just typecheck/lint) for any subagent task that adds or modifies a hydrated React island, given the silently-incomplete `node_modules` incident this session.
