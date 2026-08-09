<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=data-widget-authoring
  Checkboxes here are a human-readable index; bead status is the source of truth.
  (Do NOT hydrate until these artifacts have passed human review — see abf-k7d.2.)
-->

## 1. DataTable opt-in syntax spike (gates the rest of section 2)

- [ ] 1.1 Prototype the three candidate opt-in signals from `design.md` Decision 3 for upgrading a GFM markdown table to `<DataTable>`: a leading HTML-comment/directive marker, a `remark-directive` container (`:::table`), and a caption-row convention. For each, confirm it is opt-in (a plain unmarked table stays static HTML) and greppable in source.
  Validation: a scratch MDX file with one marked and one unmarked table; the marked one becomes an interactive table and the unmarked one stays a static `<table>` under `bun start`. Record which candidate is chosen and why.
- [ ] 1.2 Decide the dependency question surfaced by 1.1: if `remark-directive` is chosen, confirm it clears `bunfig.toml`'s `minimumReleaseAge` (per repo convention — do not force-install a blocked version); otherwise confirm the chosen syntax needs no new dependency.
  Validation: `bun install` succeeds with no `minimumReleaseAge` block, or the no-new-dependency path is confirmed; the decision is written into the change before section 2 proceeds.
- [ ] 1.3 Validate demand: confirm at least one real (or realistically-desired) post table that the chosen path would serve. If none exists, stop and defer section 2 per `design.md`'s migration step 1 — sections 3 and 4 stand independently.
  Validation: a named table use case is recorded, or a deferral note is written and section 2 tasks are marked deferred.

## 2. Markdown-table → DataTable upgrade (only if section 1 selects a path and confirms demand)

- [ ] 2.1 Implement a remark plugin under `src/lib/remark/` that rewrites an opted-in GFM `table` mdast node into an `mdxJsxFlowElement` named `DataTable`, deriving `columns` from the header row (`{ header, accessorKey: slug(header) }`) and `data` from body rows — following the existing `remark-callout.ts` / `remark-math-component.mjs` / `remark-mermaid-component.mjs` pattern.
  Validation: `bun run typecheck` passes; unit test (matching the existing `remark-*.test.ts` style) asserts a marked table node is rewritten and an unmarked one is left intact.
- [ ] 2.2 Register the plugin in both `remarkPlugins` arrays in `astro.config.mjs` (the `mdx()` integration config and the top-level `markdown` config), ordered after `remarkGfm` and alongside the other `remark-*-component` plugins.
  Validation: `bun run build` succeeds; a marked table in a scratch post renders as a sortable `DataTable`; a `## Scratch` table is confirmed absent from output (stripped by `remarkStripScratch` before this plugin runs).
- [ ] 2.3 Register `DataTable` in `src/lib/mdx-components.tsx` so the remark-injected node resolves at render, and confirm the hand-authored `<DataTable data={...} columns={...} />` JSX form still works unchanged.
  Validation: `bun run typecheck` and `bun run lint` pass; both the markdown-upgraded and JSX-authored tables render on the tech-demo page.

## 3. IconBlock icon-by-name

- [ ] 3.1 Extend `src/components/IconBlock.tsx`'s `icon` prop to `string | LucideIcon`, resolving the string branch via `lucide-react/dynamicIconImports.mjs` with `React.lazy`/`Suspense` and a safe fallback — reusing the pattern already in `src/components/PigeonMap.tsx`. Keep the component-reference branch working.
  Validation: `bun run typecheck` passes; `<IconBlock icon="zap" .../>` renders the icon with no per-icon import, `<IconBlock icon={Zap} .../>` still renders, and an unknown name degrades safely (no crash).
- [ ] 3.2 Add/adjust unit coverage for both `icon` branches and the unknown-name case.
  Validation: `bun run test` and `bun run coverage` pass with the new cases covered.

## 4. Reference page + convention docs

- [ ] 4.1 Update `src/content/blog/2024-05-20_tech-demo/index.mdx` to demonstrate the new lower-friction forms alongside the existing JSX forms: the opt-in markdown-table form (if section 2 shipped), the `icon="name"` string form, and a documented note that map data should be colocated in a typed `*-data.ts` module (the `map-data.ts` convention it already uses).
  Validation: `bun start` renders all forms correctly in light and dark mode; `bun run build` succeeds for the full site.

## 5. Full CI gate

- [ ] 5.1 Run the complete required CI command set and fix any failures.
  Validation: `bun scripts/verify-versions.mjs`, `bun run lint`, `bun run openspec:validate`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e` all pass.
