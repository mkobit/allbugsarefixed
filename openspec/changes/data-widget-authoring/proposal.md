## Why

`abf-k7d.2` asks whether the data/interactive widgets (`EChart`, `Map`/`PigeonMap`, `DataTable`, `IconBlock`) can move to a lower-friction authoring form than hand-authored JSX with structured props, or whether JSX is simply the right tool for genuinely complex widgets.
This is the harder half of the "just write" goal `abf-k7d.1` began: unlike content-polish widgets, these carry real data/config (chart series, table columns+rows, map markers) that a plain shortcode may not cleanly express.
The epic explicitly leaves the mechanism undecided and flags that the four widgets may not deserve identical treatment — this proposal resolves that by auditing each widget's real prop surface against the friction it actually imposes.

## What Changes

- **Establishes a per-widget authoring-mechanism decision** (the split-by-complexity outcome the epic flagged as possible), documented as a new `data-interactive-widgets` capability spec:
  - **`EChart` → no change.** Its `options` prop *is* the full Apache ECharts `EChartsOption` API surface (arbitrarily nested series/axes/tooltips/styling, and live JS in the demo). Any shortcode/YAML layer would either reinvent a lossy subset of that API or pass the object through while *losing* the TypeScript `EChartsOption` autocomplete/type-checking the JSX form has today. JSX is the right tool; the complexity is inherent to ECharts.
  - **`Map`/`PigeonMap` → no change.** Its `config` prop is already a bounded, fully-typed plain-data schema (`MapConfig`), already extracted to a colocated typed `.ts` module in the demo. Moving that data to YAML/frontmatter would lose TS type-checking for zero structural gain. The recommended convention (colocated typed `*-data.ts` module) already exists; document it, don't rebuild it.
  - **`DataTable` → the one genuine lower-friction opportunity.** Its authored inputs are pure declarative tabular data, and tabular data has a native markdown syntax that `remark-gfm` *already parses* into `table` mdast nodes (installed by `abf-k7d.1`). A remark plugin following the established `remark-*-component` pattern (as `remarkCallout`/`remarkMathToComponent`/`remarkMermaidToComponent` already do) can upgrade an **opted-in** GFM table into a sortable `<DataTable>`, columns inferred from the header row. The opt-in syntax is *not yet decided* (see design) and is scoped as a spike before implementation.
  - **`IconBlock` → a small, optional friction win.** Accept an icon *name string* (e.g. `icon="zap"`) reusing the `lucide-react/dynamicIconImports.mjs` pattern `PigeonMap` already uses for marker icons, removing the per-icon `import { Zap } from 'lucide-react'` boilerplate. Grid-shorthand shortcodes are not justified at current usage.
- **No change to the rendering pipeline.** `abf-7sf` closed with "skip TanStack for now" (recheck deferred to `abf-93j`); the Astro content-collections + MDX + React-island pipeline is treated as fixed infrastructure. (Note: `DataTable`'s TanStack *Table* dependency is unrelated to the TanStack markdown/renderer stack `abf-7sf` rejected.)

## Capabilities

### New Capabilities
- `data-interactive-widgets`: the authoring mechanism contract for the data/interactive widget set (charts, maps, sortable tables, icon blocks) — which widgets stay hand-authored JSX and why, and where a lower-friction markdown/string path is offered instead.

### Modified Capabilities
- None. `openspec/specs/` currently holds `blog-planning-via-beads` and `ui-design-tokens`; `content-polish-widgets` was archived as a change and covers reading-aid widgets, not data widgets. No existing requirement changes.

## Impact

- `src/lib/remark/`: a new `remark-*-component`-style plugin for the opted-in GFM-table-to-`DataTable` upgrade (mechanism/opt-in syntax decided by a design spike first). Registered in both `remarkPlugins` arrays in `astro.config.mjs` per the existing dual-registration pattern, ordered after `remarkGfm` (which produces the `table` nodes it consumes).
- `src/components/IconBlock.tsx`: accept an `icon` string name in addition to the current `LucideIcon` component reference, resolving via `dynamicIconImports` (the pattern already in `src/components/PigeonMap.tsx`).
- `src/lib/mdx-components.tsx` / `src/pages/blog/[...slug].astro`: `DataTable` registered as an MDX component so the remark-injected `<DataTable>` node resolves at render time (currently imported ad hoc per post).
- `src/content/blog/2024-05-20_tech-demo/index.mdx`: the reference/testbed page gains examples of the new lower-friction forms alongside the existing JSX forms (the only file using any of these widgets today — verified via `rg`).
- No new runtime dependency required for `DataTable` (uses already-installed `remark-gfm` output) unless the design spike selects `remark-directive` for opt-in — a dependency decision deferred to design, subject to `bunfig.toml`'s `minimumReleaseAge`.
- No blog post content is *required* to change; every lower-friction form is opt-in and additive, and the existing JSX forms keep working unchanged.
