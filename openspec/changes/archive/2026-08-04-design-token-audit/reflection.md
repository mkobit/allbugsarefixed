# Reflection: design-token-audit

## Process analysis

### Beads metadata

- **Turnaround time**: Same-session, start to finish (audit → proposal/specs/design/tasks → beads hydration → implementation → CI → visual verification), since the scope was deliberately narrowed to the smallest slice up front (user chose "token fix only" over two broader options).
- **Label consistency**: Directly hit the `openspec-sync` formula's labels-array templating bug while pouring this exact change (see Misses below) — had to hand-fix the label on all 16 beads rather than rely on the formula. Once hand-fixed, `meta:openspec:design-token-audit` is consistent across all of them.
- **Bottlenecks**: None significant. The one real slowdown was self-inflicted: writing `design.md`'s exact oklch values required pulling them from the installed `tailwindcss` package rather than approximating, which was correct but took an extra research step before the design could be finalized.

### OpenSpec workflow

- **Design clarity**: Good, with one real gap: `design.md` diverged from `proposal.md` on `ScrollProgress.tsx`'s inclusion without either document flagging it, and this wasn't caught until `tasks.md`'s implementation-time sweep. The design itself (once corrected) was clear enough that all 9 component migrations and both token-addition tasks were mechanical, one-file-at-a-time work with no mid-implementation re-litigation.
- **Task granularity**: Right-sized — each of the 15 tasks maps to one file (or one `global.css` section) and has an independently checkable validation step, which made claiming/closing them in bulk straightforward.
- **Artifact friction**: The adversarial-review section required before `tasks.md` earned its keep here — writing out objections to the `color-mix()` technique and the border-token-consolidation judgment call up front meant the actual implementation and visual verification had concrete things to check against, rather than a vague "make sure it still looks right."

## Follow-up actions

- **[ ] abf-kht**: Cross-check `design.md`'s scope against `proposal.md`'s stated component/file list explicitly while writing `design.md`, rather than relying on a later sweep task to catch drift between the two.
- **[ ] abf-2cq** (filed previously, corrected this session): Fix the `openspec-sync` formula's `labels` array template-substitution bug (`{{change_name}}` doesn't interpolate inside array elements, only in scalar fields like `title`) — reproduced live pouring this exact change.
