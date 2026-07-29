## Context

The blog's staged/in-progress workflow today is `YYYY-MM-DD_slug/notebook.md` → `index.mdx`, gated by a 5-value `status` frontmatter enum (`concept|draft|review|published|locked`, `src/content.config.ts`).
There are 9 dated folders under `src/content/blog/` today, but only 3 have an `index.mdx` (the rest are notebook-only, pre-dating any bead tracking):
- `2026-01-13_the-hidden-costs-of-flexible-time-off`: `status: "concept"`
- `2024-01-01_measuring-commute-cost` and `2024-05-20_tech-demo`: **no `status` field at all** — implicitly `published` today via the schema's `.default('published')`
- The other 6 folders have `notebook.md` only, no `index.mdx`, and no corresponding bead — exactly the "no dashboard of what's in flight" problem this change exists to fix.

This matters directly for the migration plan below: the two status-less posts are live in prod today, and any change to the `draft` default must not silently unpublish them.

Two problems motivate this change (see `proposal.md`):
1. No dashboard of what's in flight, and a manually-flipped `status` field that's easy to forget.
2. `notebook.md` — meant to be a fact/link/quote scratchpad — keeps getting turned into agent-written, blog-voiced prose (and stray code) by delegated agents (Jules and others), bleeding into the eventual post's voice.

`bd` (beads) is already adopted in this repo, including a molecule/formula system (`bd mol pour`) used elsewhere (`openspec-sync` formula) to spawn a DAG of child issues from a template. Sibling repos (`canopy`, `storagemaxxing`) have prior art for multi-step formulas (e.g. `storagemaxxing/.beads/formulas/feature-probe.formula.toml`): each `[[steps]]` entry becomes a child issue under a root epic, and the repo's own convention treats step order as sequential unless a step explicitly signals otherwise (e.g. `human-review`'s description says to mark itself `blocked`).

## Goals / Non-Goals

**Goals:**
- Move lifecycle/planning state out of frontmatter and into beads, with a dashboard (`bd list -l blog`) that already exists as a beads capability.
- Give each idea's lifecycle transitions their own audit trail (timestamps, notes) without hand-building a bespoke child-bead scheme — reuse the molecule/formula mechanism already used for `openspec-sync`.
- Structurally reduce the chance that research capture turns into agent-written prose or stray code, since documentation alone (`AGENTS.md`) has not prevented this in practice.
- Keep frontmatter to the one thing Astro actually needs at build time: is this post visible or not.

**Non-Goals:**
- Not changing the `YYYY-MM-DD_slug/` folder shape, `notebook.md` → `index.mdx` two-file convention, or the Astro content-collection loader.
- Not building new tooling — `bd list`/`bd mol progress` is the dashboard.
- Not addressing hosting (GitHub Pages vs CloudFront, `abf-zdv.3`) or live/prod testing (`abf-zdv.2`) — separate epics.
- Not migrating historical git history of `notebook.md` content; this is a forward-looking process change.

## Decisions

**1. Lifecycle tracking via a `blog-lifecycle` beads formula, poured once per idea, rather than a single label flip.**
`bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="..."` creates a root epic plus five child issues (`seed`, `researching`, `drafting`, `review`, `published`), explicitly chained via each step's `after_step`/`depends_on` field so closing one unblocks the next. Advancing a stage = closing the current stage's bead, which unblocks the next.
*Why `after_step`/`depends_on` and not declaration order:* this repo's own sibling formulas (`openspec-sync.formula.toml`, and `storagemaxxing/.beads/formulas/feature-probe.formula.toml` used as prior art) do **not** chain their `[[steps]]` — an adversarial review of this design confirmed, by pouring `feature-probe` for real and inspecting with `bd mol show --parallel`, that all steps land in one unblocked parallel group with zero dependencies between them; the apparent sequencing in `feature-probe` is enforced only by step-description text telling the agent what order to work in, not by real blocking. The `bd` binary does support real chaining (`AfterStep`/`DependsOn` TOML-tagged fields confirmed via binary inspection), it's just unused by the formulas we were treating as prior art. `blog-lifecycle.formula.toml` must set these fields explicitly on every step after `seed`.
*Why over a single-bead label flip:* the original proposal draft considered a single bead with a `stage:*` label that gets edited in place. That's simpler but loses per-transition timestamps and requires remembering to flip a label (the same failure mode as the `status` field it replaces). A molecule with real dependency chaining gives that audit trail for free since every `bd` issue already has created/closed timestamps, and `bd ready`/`bd mol progress` becomes the "what's next" view instead of a manually-maintained label.
*Why over a child-bead-per-transition hand-rolled scheme:* that's what a molecule formula *is* — building it as a reusable formula means every future post idea gets the same structure with one command, instead of manually creating five linked issues per idea.
*Alternative considered:* keep `bd q "post idea: ..."` for zero-ceremony capture, and only pour the fuller molecule once an idea graduates past `seed`. Rejected for now — pouring the whole molecule at capture time is still one command, and having the `seed` bead already exist as stage 1 of the same molecule avoids a manual "convert this quick-capture bead into a molecule" step later. If in practice `seed`-stage ideas pile up unused, this is cheap to revisit (see Open Questions).

**2. Formula step descriptions carry the notebook/prose guardrail directly, not just `AGENTS.md`.**
The `researching` step's description in `blog-lifecycle.formula.toml` states explicitly: `notebook.md` is fact/link/quote/rough-note capture only; no publish-voice prose; code or data goes in auxiliary files (`data.csv`, `map.ts`), not inline.
*Why:* `AGENTS.md`'s existing persona section already says "Do Not: Write the prose... Do not try to mimic the user's voice," and this has not been followed in practice by delegated agents. Putting the constraint on the bead itself — what an agent actually reads when it claims `stage:researching` — is a second, more proximate surface for the same rule, on the theory that a static doc gets skimmed once while a live task's description is read at point of work. `AGENTS.md` is still rewritten for the human-facing/canonical version of the rule; the formula text is a duplicate, not a replacement.

**3. `notebook.md`'s template is reworked to structurally discourage prose.**
Current template (`scripts/new-idea.ts`): `# Title` / `## Idea` / `## References` — an open `## Idea` heading invites free-form paragraphs. New template uses headers that read as capture buckets, not essay sections (exact headers are an implementation detail for `tasks.md`, but the direction is: separate raw links/quotes from the human's own rough thoughts from agent-research findings, with no heading that reads as "write the post here").
*Why structural over documentation-only:* same reasoning as (2) — a template shape nudges behavior at the point of writing, which has proven more reliable than a policy statement elsewhere in this same file.

**4. Frontmatter collapses to `draft: boolean`.**
Replaces the 5-value `status` enum. `locked` and `review` currently have zero real usage, so no behavior is lost in the collapse. The schema field itself has **no default** — every `index.mdx` that exists or is created must set `draft` explicitly. This is a deliberate change from the current schema's `.default('published')`: that default is what makes this migration dangerous (see below), and a build-visibility switch should never silently decide a post's visibility via an unstated default. `astro check`/`bun typecheck` (already a required CI gate per `AGENTS.md`) enforces this at build time once the field is required.
*Consumer sites (repo-wide grep, no RSS/feed file exists):* `src/layouts/Layout.astro` (search index), `src/pages/blog/[...slug].astro` (prod static-path gate + a per-status badge), `src/pages/blog/index.astro`, `src/pages/index.astro` (listing filters) — all four flip from `status === 'published'`-shaped checks to `!draft`. The per-status badge in `[...slug].astro` (which today renders whatever the raw status string is) collapses to a single "Draft" badge shown only when `draft === true`, since there's no longer a distinct string to display.
*Side effect:* today's `Layout.astro` search index only includes `status === 'published'`, while `[...slug].astro`'s prod static-path gate also allows `'locked'` — an existing inconsistency (a `locked` post would build a page but not appear in search). Collapsing to one boolean fixes this as a byproduct, not a deliberate goal.
*Correction from adversarial review:* an earlier draft of this decision defaulted `draft` to `true` and claimed "only one post exists," which is wrong (see Context) — two posts (`2024-01-01_measuring-commute-cost`, `2024-05-20_tech-demo`) have no `status` field and are live in prod today via the `'published'` default. A `default(true)` would have silently unpublished them; a required field with no default, paired with an explicit migration step per existing post, avoids that.

## Risks / Trade-offs

- **[Risk] Pouring a 5-stage molecule for every fleeting idea is heavier than a bare `bd create`.** → **Mitigation:** it's still one command; `bd mol burn`/closing the root epic handles abandoned ideas the same as closing any bead would.
- **[Risk] Formula step descriptions drift out of sync with `AGENTS.md` since the guardrail text now lives in two places.** → **Mitigation:** treat `AGENTS.md` as canonical and the formula text as a short pointer/summary rather than a full restatement, reviewed together whenever either changes (call out in the PR description, not enforced by tooling — acceptable given this is a two-person-scale repo).
- **[Risk] A template shape change doesn't actually stop an agent that's determined to write prose into `notebook.md`; it only nudges.** → **Mitigation:** this was already true of the current `AGENTS.md`-only approach and is not made worse; genuinely preventing it would require a build-time or CI check (e.g. flagging long paragraph runs in `notebook.md`), which is out of scope for this change and can be filed as a follow-up if the structural nudge proves insufficient in practice.
- **[Risk] Nothing prevents or detects pouring `blog-lifecycle` twice for the same slug**, and an abandoned `stage:seed` bead looks identical to "not started yet." → **Mitigation:** the capture instructions (`AGENTS.md` rewrite, task in `tasks.md`) must include a pre-pour check (`bd search <slug>` or `bd query "label=blog AND external_ref~<slug>"`) before running `bd mol pour`.
- **[Risk] 6 existing folders have `notebook.md` only, no `index.mdx`, and no bead** — silently excluded from the new dashboard, leaving the exact "no visibility into what's in flight" problem unsolved for pre-existing ideas. → **Mitigation:** added as an explicit Migration Plan step (backfill a `blog-lifecycle` pour at `stage:researching` for each) rather than left implicit.
- **[Risk, verified during adversarial review] `.formula.toml` `[[steps]]` are NOT chained by declaration order** — confirmed by pouring the prior-art `feature-probe` formula for real and inspecting with `bd mol show --parallel`: all steps land in one unblocked group. → **Mitigation:** addressed directly in Decision 1 above (`blog-lifecycle.formula.toml` sets `after_step`/`depends_on` explicitly); `--dry-run --json` does not surface dependency info, so verification must be pour → `bd mol show --parallel` → delete the test pour, not a dry-run.

## Migration Plan

Order matters: frontmatter for every existing `index.mdx` is migrated **before** `content.config.ts` makes `draft` a required field with no default, so the build is never in a state where an existing post is silently invalid or silently unpublished.

1. Write `.beads/formulas/blog-lifecycle.formula.toml` (5 steps chained via explicit `after_step`/`depends_on`, vars: `slug`, `title`). Verify chaining by pouring once, inspecting with `bd mol show --parallel`, then deleting the test pour — not `--dry-run` (see Risks).
2. Migrate all 3 existing `index.mdx` posts' frontmatter first, while `status` and `draft` can briefly coexist:
   - `2026-01-13_the-hidden-costs-of-flexible-time-off`: `status: "concept"` → `draft: true`
   - `2024-01-01_measuring-commute-cost`: (no field) → `draft: false`
   - `2024-05-20_tech-demo`: (no field) → `draft: false`
3. Update `src/content.config.ts`: `status` enum → `draft: z.boolean()` (no default — required field).
4. Update the 4 consumer call sites (`Layout.astro`, `[...slug].astro` ×2 usages, `blog/index.astro`, `pages/index.astro`) to read `draft` instead of `status`; collapse the `[...slug].astro` status badge to a single "Draft" indicator.
5. Backfill a `blog-lifecycle` pour (at `stage:researching`, since research has already started) for each of the 6 existing notebook-only folders, so they're visible in the new dashboard instead of silently excluded.
6. Rework `scripts/new-idea.ts`'s notebook template.
7. Rewrite `src/content/blog/AGENTS.md`: lifecycle section describes the molecule-driven flow (including the pre-pour idempotency check); persona section gets explicit notebook-vs-prose DO/DON'T examples.
8. Run full CI gate locally (`bun lint`, `bun openspec:validate`, `bun typecheck`, `bun test`, `bun coverage`, `bun build`, `bun test:e2e`) before merge, per `AGENTS.md`.
9. Rollback: this is a frontmatter/tooling change affecting 3 real posts; rollback is a straightforward `git revert` of the migration commit(s), no data migration risk beyond those 3 posts' frontmatter and the backfilled molecules (which can simply be closed/burned).

## Open Questions

- If `seed`-stage beads (captured ideas with no research yet) pile up unused for a long time, is the "pour the whole molecule at capture" decision (Decision 1) still the right default, or should capture go back to a bare `bd create`/`bd q` with the fuller molecule poured only on promotion? Revisit after a few months of real usage — not blocking for this change.
- Exact `notebook.md` template headers (Decision 3) are left to `tasks.md`/implementation rather than pinned here, since the important constraint is "no heading that reads as an essay section," not the specific wording.

## Adversarial review and mitigations

Performed by an independent agent with fresh context (no prior exposure to this design's authoring), per this repo's own `feature-probe` formula convention (`storagemaxxing/.beads/formulas/feature-probe.formula.toml`'s `hole-poking` step: adversarial review must not be the author re-reading their own work). Findings, each verified against real evidence rather than taken on faith:

1. **Core chaining mechanism didn't work as designed.** The design's original claim — that `[[steps]]` in a `.formula.toml` chain sequentially by declaration order, per sibling-repo convention — is false. Verified by pouring the prior-art `feature-probe` formula for real and inspecting with `bd mol show --parallel`: all 5 steps landed in one unblocked parallel group. The `bd` binary supports real chaining via `after_step`/`depends_on` TOML fields (confirmed via binary string inspection), but the formulas being copied as prior art don't use them. **Fixed:** Decision 1 now specifies explicit `after_step`/`depends_on` on every non-seed step.
2. **The design's own verification plan for that risk didn't work either.** `--dry-run --json` output has no dependency info; only a real pour + `bd mol show --parallel` surfaces it. **Fixed:** Migration Plan step 1 and the corresponding Risk entry now specify pour → inspect → delete.
3. **"Exactly one post exists" was factually wrong.** There are 9 folders; 3 have `index.mdx`; 2 of those have no `status` field and rely on the schema's `.default('published')` — they're live in prod today. The original Decision 4 (`draft` defaulting to `true`) would have silently unpublished them. **Fixed:** Context section corrected; Decision 4 changed to a required field with no default; Migration Plan reordered so frontmatter migration happens before the schema change, with explicit `draft` values for all 3 real posts.
4. **6 more folders are notebook-only with no bead at all** — the exact "no dashboard" problem this change targets, left unaddressed by the original migration plan. **Fixed:** added as Migration Plan step 5 (backfill a `stage:researching` pour for each) and as a Risk entry.
5. **No idempotency guard on pouring the same slug twice.** Not something the reviewer could disprove or confirm empirically (it's a process gap, not a mechanism), but flagged as a real gap. **Fixed:** added as a Risk entry with a concrete mitigation (pre-pour `bd search`/`bd query` check, to be written into the `AGENTS.md` capture instructions).

Not flagged by the review, and therefore left as-is: the overall shape of Decisions 1–3 (molecule-per-idea over label-flip or hand-rolled child beads; guardrail text living in both the formula and `AGENTS.md`; notebook template rework) held up against the "is this justified vs. the rejected alternative" and "is this magical thinking" adversarial questions the reviewer was asked to specifically probe.
