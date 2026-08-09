## Context

`abf-k7d.2` is the last of the three `abf-k7d` authoring siblings to land: `abf-k7d.1` (content-polish widgets — footnotes + TOC scroll-spy) and `abf-k7d.3` (design-token audit) both closed, and `abf-k7d.4` landed with "no enforced boundary, convention-only spine sequencing." This epic extends `abf-k7d.1`'s remark-shortcode authoring pattern and reworks `src/components/ui/*` widgets that `abf-k7d.3` restyled, so it was held until both landed.

The four in-scope widgets and their real prop surfaces, read from source this session:

- **`EChart`** — `src/components/EChart.astro` (a thin `client:only="react"` glue wrapper) → `src/components/EChart.tsx`. Prop: `options: EChartsOption` (from the `echarts` package's own types), plus `height`/`width`. `EChartsOption` is the entire Apache ECharts configuration API — series (dozens of chart types), axes, tooltips, legends, per-item styling, animation. The tech-demo even runs live JS inside the prop: `data.map((d) => ({ value: parseInt(d.bugs || "0"), name: d.month || "" }))` (`2024-05-20_tech-demo/index.mdx:223`), where `data` is `csvParse(rawData)` from a colocated `data.csv?raw` import.
- **`Map`/`PigeonMap`** — `src/components/PigeonMap.tsx`, a `client:load` React island. Prop: `config: MapConfig` (`src/lib/map/index.ts`), a bounded, fully-typed plain-data schema: `center`, `zoom`, `markers[]` (`lat`/`lng`/`title`/`description`/`icon`), `shapes[]` (a `circle | polygon` discriminated union). In the demo it is already extracted to a colocated typed module `map-data.ts` and passed as `<Map client:load config={demoMapData} />`. It carries no JSX and no live logic — pure typed data.
- **`DataTable`** — `src/components/ui/table.tsx`, a `client:load` React island using `@tanstack/react-table`. Props: `data` (row objects) and `columns` (`ColumnDef[]`). The demo's usage is purely declarative: `userColumns` is four `{ header, accessorKey }` objects and `users`/`data` are plain arrays (one inline, one CSV-parsed). TanStack's richer column features (custom `cell` renderers, typed sorting) are available but unused in the demo.
- **`IconBlock`** — `src/components/IconBlock.tsx`, a `client:visible` React island. Props: `icon: LucideIcon` (a *component reference*, requiring `import { Zap } from 'lucide-react'` per icon), optional `label`, and a `variant` enum. In the demo, icon blocks are hand-wrapped in ad-hoc grid `<div className="grid grid-cols-2 md:grid-cols-4 gap-4">` markup.

**Usage reality (verified via `rg`):** the only file in `src/content/blog/**` that uses *any* of these four widgets is the `2024-05-20_tech-demo/index.mdx` reference/testbed page. No real authored post carries a chart, map, table, or icon block. The authoring friction these widgets impose is therefore currently *latent* — it bites only when the author next wants one of these in a real post. This is the single most important constraint on scope: build the minimum that removes friction for the cases most likely to actually occur; do not speculatively schema-ify all four.

**Fixed infrastructure (do not re-litigate):** `abf-7sf` closed 2026-07-31 with "skip TanStack for now" (recheck deferred to `abf-93j`, 2027-01-31). The Astro content-collections + MDX + React-island rendering pipeline is treated as unchanging. `DataTable`'s `@tanstack/react-table` dependency is unrelated to the TanStack markdown/renderer stack `abf-7sf` evaluated and rejected — keeping `DataTable` is not "adopting TanStack."

**Existing shortcode precedent:** the repo's lower-friction authoring mechanism is a remark plugin that matches an mdast node and rewrites it into an `mdxJsxFlowElement`/`mdxJsxTextElement` referencing a React component. `src/lib/remark/remark-callout.ts` (blockquote `[!type]` → `<Callout>`), `remark-math-component.mjs` (`math`/`inlineMath` → `<Latex>`), and `remark-mermaid-component.mjs` (mermaid fence → `<Mermaid>`) all follow it, dual-registered in both `remarkPlugins` arrays in `astro.config.mjs` (the `mdx()` integration config and the top-level `markdown` config; the file's own comment on lines 22–26 explains the dual registration). `remark-gfm@^4.0.1` is *already installed and registered in both arrays* (added by `abf-k7d.1` for footnotes), so GFM `table`/`tableRow`/`tableCell` mdast nodes are already produced today — they simply render as static `<table>`.

## Goals / Non-Goals

**Goals:**
- Decide, per widget, whether a lower-friction authoring form is warranted, with the decision grounded in each widget's real prop surface and actual usage — not a uniform mechanism imposed on all four.
- Where a lower-friction form is warranted, define it as opt-in and additive, reusing the repo's established remark-`*`-component pattern and already-installed dependencies where possible.
- Keep every existing hand-authored JSX form working unchanged.

**Non-Goals:**
- Replacing or wrapping the ECharts API or the `MapConfig` schema with a bespoke DSL/YAML layer.
- Swapping the rendering pipeline (settled by `abf-7sf`).
- Covering TanStack's advanced column features (custom cell renderers, typed sort) through the markdown path — those stay in the JSX form.
- Building an icon-*grid* shorthand (a syntax for "N icons in a responsive grid") — not justified at current usage.
- Restyling these widgets (that was `abf-k7d.3`'s scope) beyond what a new authoring path incidentally requires.

## Decisions

### 1. `EChart` → no change. JSX with a structured `options` prop is the right tool.
The `options` prop *is* the Apache ECharts API surface. Any lower-friction layer has exactly two shapes, both worse:
- **A DSL/YAML subset** (`type: line`, `series: [...]`, etc.) reinvents a lossy fraction of `EChartsOption` and commits the repo to perpetually chasing the ECharts API for anything the subset omits (dual axes, custom `itemStyle`, `emphasis`, `avoidLabelOverlap` — all used in the demo's two charts).
- **A pass-through** (YAML/JSON that becomes the `options` object) changes nothing structurally and *loses* the TypeScript `EChartsOption` autocomplete and type-checking the JSX form gets today — the exact anti-pattern the epic warns about ("relocates the same complexity into a different syntax with worse tooling").

The demo also runs live JS inside `options` (CSV parse + `data.map`), which a static text form cannot express at all. Verdict: keep hand-authored JSX; the complexity is inherent to charting, not to the wrapper.
*Alternative considered:* a thin `<LineChart>`/`<PieChart>` convenience wrapper over the 2–3 most common chart types. Rejected at current usage (zero real charts) as speculative; can be revisited if a real posting pattern emerges.

### 2. `Map`/`PigeonMap` → no change. Already typed plain data; document the colocated-module convention.
`MapConfig` is already a bounded, typed, JSX-free, logic-free data schema — the "schema-driven data layer" the epic hypothesizes about *already exists* as a TypeScript type. The demo already demonstrates the low-friction convention: put the data in a colocated `*-data.ts` module and pass it as `config`. Moving that same data into YAML frontmatter or a shortcode body would strip the TS type-checking (`map-data.ts` gets `MapConfig` validation today) for an identical JSON-shaped payload — strictly worse tooling. Verdict: no code change; document "colocate map data in a typed `*-data.ts` module" as the recommended convention in the tech-demo reference page.
*Alternative considered:* a `map` content-collection with a Zod schema so map data lives in frontmatter/data files validated by Astro. Rejected — `MapConfig` already provides equivalent validation with better ergonomics (compile-time, in-editor), and a content collection adds indirection for data that belongs next to the one post using it.

### 3. `DataTable` → the one genuine opportunity: opt-in markdown-table → `DataTable` upgrade.
This is the only widget whose authored input is *pure declarative tabular data* AND has a native markdown syntax AND fits the existing remark pattern. `remark-gfm` already turns a markdown table into `table` mdast nodes (installed by `abf-k7d.1`); today they render static. A new remark plugin — following `remark-callout`/`remark-math-component`/`remark-mermaid-component` exactly — can rewrite an **opted-in** `table` node into an `mdxJsxFlowElement` named `DataTable`, deriving `columns` from the header row (`{ header: <cell text>, accessorKey: <slug of header> }`) and `data` from body rows. The author writes an ordinary markdown table (free, no imports) and flips one opt-in signal to get sortability. `DataTable` is registered in the shared MDX component map so the injected node resolves at render.

**What is deliberately left undecided (spike first, per repo convention):** the *opt-in signal*. Options, to be prototyped and chosen in task 1 before any plugin is written:
- a leading HTML-comment / directive marker immediately preceding the table (no new dependency; matches how `remarkStripScratch` keys off structure),
- a `remark-directive` container (`:::table`), which is the most ergonomic but adds a dependency not currently installed (verified: `remark-directive` is absent from `package.json`) and subject to `bunfig.toml`'s `minimumReleaseAge`,
- a caption-row convention (e.g. a first-cell sentinel).
The epic and repo convention both say: when the approach isn't decided, state the problem and leave the solution to the design/spike phase rather than prescribe. This design commits to the *mechanism class* (remark rewrite over already-parsed GFM tables) and the *constraint* (must be opt-in — plain tables must stay static HTML, no blanket island upgrade), and defers the exact syntax.
*Scope guard:* only header + string cells are supported via markdown. Typed sort and custom cell renderers stay in the JSX form (Decision covered in spec's third scenario).

### 4. `IconBlock` → accept an icon name string, reusing the existing dynamic-import pattern.
The only real friction in `IconBlock` is the per-icon `import { Zap } from 'lucide-react'` line. `PigeonMap` already resolves lucide icons *by string name* via `lucide-react/dynamicIconImports.mjs` (`src/components/PigeonMap.tsx:1,41-46`: `dynamicIconImports[iconName]` + `React.lazy`). Extending `IconBlock`'s `icon` prop to accept `string | LucideIcon` and resolving the string branch through that same mechanism removes the import boilerplate for the common case, using a pattern already proven in-repo — no new dependency, no shortcode machinery. The component-reference form stays supported (back-compat, and needed for icons passed programmatically). Unknown names degrade safely, matching `PigeonMap`'s `if (!IconImport) return null`.
*Alternative considered:* a grid-shorthand shortcode for icon rows. Rejected — needs a bespoke syntax for the grid container plus N items, and with zero real usage it is speculative; the ad-hoc grid `<div>` wrapper the demo uses is fine for the rare case.

### 5. `modern-web-guidance` check (mandatory per AGENTS.md, since client islands are in the touched surface).
Searched this session: "progressively enhance a static HTML table into an interactive sortable widget" and "client hydration directive for below-the-fold interactive island." No exact-match guide (top similarity 0.47); the closest, `interactions-in-complex-layouts` (`content-visibility` for data-heavy grids, similarity 0.40), is a rendering-performance affordance, not an authoring-mechanism decision. Conclusion: no guide dictates the mechanism here. The one concrete client-side surface this change adds — a hydration directive for markdown-upgraded `DataTable` islands — should reuse `DataTable`'s current `client:load`, or be reconsidered against `client:visible` during implementation if below-the-fold tables prove common; noted, not blocking. Recorded here to satisfy the "check even if you don't touch the surface" mandate.

## Risks / Trade-offs

- **[Risk]** Building the `DataTable` markdown path with zero current real-world tables is speculative — it could ship unused. → **Mitigation:** it is the only mechanism that clears the "genuinely lower-friction AND cleanly expressible AND fits the existing pattern" bar, and it is small, opt-in, and reversible (a single remark plugin, no schema migration). Task 1 is a spike that also validates it against a real desired table before the plugin is committed; if the spike finds no compelling near-term use, the implementation task can be deferred without wasting the design.
- **[Risk]** An opt-in table syntax that is too subtle could silently fail (author expects sortability, gets a static table) or too aggressive could turn every table into a JS island (regressing `abf-k7d.1`'s accepted "plain GFM tables render as default-prose HTML" non-goal and adding hydration cost). → **Mitigation:** the spike's acceptance criteria explicitly require (a) plain tables unchanged and (b) an opt-in signal that is visible/greppable in source; the spec encodes both as scenarios.
- **[Trade-off]** Accepting `icon` as `string | LucideIcon` is a small prop-type union that two code paths must handle. → Accepted; it mirrors `PigeonMap`'s existing dual handling and is covered by the spec's three IconBlock scenarios.
- **[Trade-off]** Registering `DataTable` in the global MDX component map (so remark-injected nodes resolve) means it is always in scope for posts. → Low cost; it is only bundled into posts that actually render a `DataTable`, since it is a React island hydrated on use.

## Adversarial review and mitigations

- **Objection: "The epic asked to design a *lower-friction authoring path* — concluding 'no change for 2 of 4 widgets' looks like the design failed to find one."** → Mitigation: the task and epic both explicitly name "hand-authored JSX is the right tool for genuinely complex widgets" as a legitimate, expected outcome, and flag that the four "may not deserve identical treatment." The no-change calls are *derived*, not defaulted: for `EChart` the prop is a third-party API surface (any text layer is lossy or tooling-worse); for `Map` the "schema-driven data layer" the epic hypothesizes *already exists* as the `MapConfig` type. Finding that the lower-friction path already exists (Map) or would be strictly worse (EChart) is a merits-based answer, not an absence of one.
- **Objection: "You're building the DataTable path on zero demand — that's speculative feature-work the repo's own 'minimum code, no speculative features' rule forbids."** → Mitigation: this is why task 1 is a spike gated on validating against a real desired table, and why the exact syntax is deferred rather than prescribed. The design commits only to the mechanism *class* and the opt-in constraint; if the spike shows no near-term use, implementation is deferred with the design intact. Nothing schema-shaped or irreversible is built ahead of need.
- **Objection: "Header-row-only column inference is a toy — the moment anyone wants numeric sort or a formatted cell, the markdown path breaks and they're back to JSX, so it saves nothing."** → Mitigation: correct that it is deliberately bounded to simple string tables — and the spec says so explicitly (third scenario routes typed/custom cases to JSX). The value is precisely the simple case: a plain markdown table (which the author writes anyway) becoming sortable with no imports and no `columns` array. It is a strict superset of today (plain tables still render), never a regression.
- **Objection: "`remark-gfm` producing table nodes doesn't mean rewriting them is safe — a naive plugin could grab tables inside `## Scratch`, inside code fences, or tables the author wanted static."** → Mitigation: the opt-in constraint handles the last case (only marked tables upgrade). `remarkStripScratch` already runs before component-rewrite plugins in the array order, so `## Scratch` tables are gone before this plugin sees them (same guarantee every other rewrite plugin relies on). Code-fence content is never parsed as a `table` mdast node by `remark-gfm`, so it is structurally out of reach. The spike will assert plugin ordering (after `remarkGfm`, alongside the other `remark-*-component` plugins) as an acceptance check.
- **Objection: "Is deferring the opt-in syntax to a spike just punting the actual design decision this epic exists to make?"** → Mitigation: the epic's core question — *which widgets warrant a lower-friction path at all, and of what class* — is answered here decisively (3 answered "no/already-exists/name-string", 1 answered "yes, remark rewrite over GFM tables"). The deferred item is a narrow syntax choice among three concrete named options with a stated selection criterion, exactly the kind of "verify by prototyping before committing" the repo convention prescribes — not the epic's headline question.
- **Objection: "Accepting `icon` as `string | LucideIcon` adds a client-side dynamic import (`React.lazy`) per icon — does that regress `IconBlock`'s render or a11y versus the static component reference?"** → Mitigation: it reuses `PigeonMap`'s already-shipped `dynamicIconImports` + `Suspense`/`lazy` path verbatim, including its `FallbackIcon` and null-on-unknown behavior; the component-reference form stays available for anyone who wants the static import. `IconBlock`'s icon is already `aria-hidden="true"` (decorative), so the async swap has no a11y impact.

## Migration Plan

No data migration; every change is additive and opt-in. Deploy as a normal PR (or, per repo convention, as staged beads work after human review of these artifacts):
1. **Spike (task 1):** prototype and choose the `DataTable` opt-in syntax against a real desired table; record the choice and any dependency decision (e.g. whether `remark-directive` is warranted, checked against `bunfig.toml`'s `minimumReleaseAge`). If the spike finds no near-term use, stop here and defer the rest — the `EChart`/`Map`/`IconBlock` decisions stand independently.
2. Implement the remark `table` → `<DataTable>` plugin per the chosen syntax; register it in both `remarkPlugins` arrays after `remarkGfm`, matching the existing `remark-*-component` registration; register `DataTable` in `src/lib/mdx-components.tsx`.
3. Extend `IconBlock`'s `icon` prop to `string | LucideIcon`, resolving the string branch via `dynamicIconImports` (the `PigeonMap` pattern).
4. Update `2024-05-20_tech-demo/index.mdx` to demonstrate the new opt-in table form and the string-name icon form alongside the existing JSX forms, and document the colocated-`*-data.ts` map convention.
5. Run the full CI gate (`bun scripts/verify-versions.mjs`, `bun run lint`, `bun run openspec:validate`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e`) and a `bun start` visual check of the tech-demo page.
6. Rollback is a normal `git revert` — no stateful or irreversible change.

## Open Questions

### RESOLVED — `DataTable` opt-in syntax (task-1 spike, abf-k7d.2.1 → 2.2 → 2.3)

**Chosen signal: a leading MDX comment marker `{/* datatable */}` on its own line immediately before the table.**
The remark plugin matches a `table` node whose immediately-preceding sibling is an `mdxFlowExpression` node with a `/* datatable */` comment body, then rewrites the table into `<DataTable client:load ... />`.

Prototyped all three candidates against `unified().use(remarkParse).use(remarkMdx).use(remarkGfm)` (the real MDX parse path — every post is `.mdx`), inspecting the resulting mdast:

- **Candidate 1 (leading comment / directive marker).** The literal HTML-comment form `<!-- datatable -->` from Decision 3 is a **hard parse error in MDX** — MDX rejects `<!-- -->` and tells you to use `{/* text */}`. The MDX-native equivalent `{/* datatable */}` parses to a distinct `mdxFlowExpression` sibling directly before the `table` node, so the plugin keys off adjacency exactly the way `remarkStripScratch` keys off structure. Opt-in (a plain table has no such preceding node), greppable (`rg '\{/\* datatable \*/\}'`), and **needs no new dependency**. This is the chosen option.
- **Candidate 2 (`remark-directive` container `:::table`).** Without the plugin, `:::table` parses to a plain `paragraph` of literal text `":::table"` followed by the table — i.e. it does nothing and leaks the marker into rendered output — so `remark-directive` is *mandatory* for this syntax, and it also nests the table inside a `containerDirective` node (a more complex match). Ruled out on the **minimal-dependency** criterion, not on the release gate (see 1.2 below).
- **Candidate 3 (caption-row / first-cell sentinel).** A sentinel like `[datatable]` in the first header cell parses as an ordinary table, but the sentinel becomes a **visible header cell** the plugin must strip, and any real table whose first header coincidentally matched would be falsely upgraded. Ruled out — least clean, most error-prone, poorest opt-in isolation.

**End-to-end validation (task 1.1).** A throwaway remark transform (marker-adjacency match → `mdxJsxFlowElement` `DataTable` with `data`/`columns` derived from header + body rows, plus an injected `import { DataTable }` so the `client:load` island resolves) was wired temporarily into both `remarkPlugins` arrays after `remarkGfm` and exercised via `bun start`.
A scratch post with one marked and one unmarked table, fetched over HTTP, rendered the marked table as a hydrated `DataTable` astro-island (`client="load"`, sortable headers with chevron icons) and left the unmarked table as a static `<table>` outside any island.
All throwaway code and scratch content were removed after the check.

**Implementation note for abf-k7d.2.4 (do not treat as decided design, just a spike finding):** a remark-injected `<DataTable client:load>` does **not** hydrate via the `<Content components={...}>` map alone — Astro reports `Could not render DataTable. No matching import has been found` because client directives need a statically analyzable import. The plugin must inject an `mdxjsEsm` import node for `DataTable` (or task 2.3 must otherwise give the island a real import); registering it in `mdx-components.tsx` covers server-rendered resolution but not island hydration.

### RESOLVED — dependency question (task 1.2)

The chosen `{/* datatable */}` marker needs **no new dependency** — it rides on the already-installed `remark-mdx`/MDX parser and `remark-gfm`.
`remark-directive` (the only candidate that would have added one) was checked against `bunfig.toml`'s `minimumReleaseAge = 1209600` (14 days): its current `3.x` release is years old and would clear the gate, so the gate is *not* the reason it was dropped — the minimal-dependency criterion is.
No `bun add` was run; the no-new-dependency path is confirmed.

### RESOLVED — demand (task 1.3)

At least one real markdown table exists today: the comparison table in `src/content/blog/2026-01-13_the-hidden-costs-of-flexible-time-off/index.mdx` (Metric / Traditional Accrual / FTO, 3 body rows).
It is a small comparison table where sortability is marginal, but it is genuine tabular content the opt-in path would serve (consistent styled table; opt-in, so it stays static unless marked), and the blog's data-oriented framing makes near-future sortable tables (bug metrics, benchmarks — cf. the tech-demo's bug-count charts) plausible.
Demand is confirmed; section 2 (`DataTable` upgrade plugin, abf-k7d.2.4/2.5/2.6) may proceed. Sections 3 (`IconBlock`) and 4 stand independently regardless.
