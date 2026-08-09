## ADDED Requirements

### Requirement: Complex-config widgets remain hand-authored JSX
The system SHALL continue to accept `EChart` and `Map`/`PigeonMap` as hand-authored JSX in MDX with their existing structured props (`options: EChartsOption` for `EChart`; `config: MapConfig` for `Map`), and SHALL NOT require or impose a shortcode/YAML authoring layer for them. Their config surfaces are either the full third-party API (`EChartsOption`) or an already-typed plain-data schema (`MapConfig`), for which a lower-friction text form would lose TypeScript type-checking without reducing structural complexity.

#### Scenario: Author writes a chart with the existing JSX form
- **WHEN** a post uses `<EChart options={{ ...full ECharts option object... }} />`
- **THEN** it renders unchanged, retaining full `EChartsOption` type-checking and autocomplete at author time, with no deprecation of the JSX form

#### Scenario: Author writes a map with the existing config form
- **WHEN** a post uses `<Map client:load config={mapData} />` where `mapData` is a typed `MapConfig` value (inline or imported from a colocated `*-data.ts` module)
- **THEN** it renders unchanged, and the colocated typed data module is the documented convention for keeping map data out of the MDX body

### Requirement: Simple tabular data may be authored as a markdown table
The system SHALL provide an opt-in mechanism by which a plain GFM markdown table in MDX content is upgraded at build time into an interactive sortable `DataTable`, with columns derived from the table's header row and rows from its body, so that simple tabular data can be authored without hand-writing `data`/`columns` JSX arrays or per-post component imports. Tables that are not opted in SHALL continue to render as static HTML tables (unchanged from current GFM behavior). The specific opt-in syntax is resolved by a design spike before implementation.

#### Scenario: Author opts a markdown table into an interactive table
- **WHEN** a post contains a GFM markdown table marked with the agreed opt-in signal
- **THEN** the rendered page shows a sortable `DataTable` whose column headers come from the table's header row and whose rows come from the table body, without the author importing or hand-authoring `DataTable`, `data`, or `columns`

#### Scenario: A plain markdown table is not opted in
- **WHEN** a post contains an ordinary GFM markdown table with no opt-in signal
- **THEN** it renders as a static HTML table exactly as it does today, with no client-side JavaScript island introduced

#### Scenario: Data needs typed sorting or custom cell rendering
- **WHEN** tabular content requires typed sort order, custom cell renderers, or column definitions beyond header + string cells
- **THEN** the author uses the hand-authored `<DataTable data={...} columns={...} />` JSX form, which remains fully supported; the markdown-table path is not required to cover these cases

### Requirement: Icon blocks may reference icons by name
The system SHALL allow `IconBlock` to accept a lucide icon identified by string name (e.g. `icon="zap"`), resolved through the same `lucide-react` dynamic-import mechanism already used for map marker icons, in addition to the existing `LucideIcon` component-reference prop. This removes the per-icon `import { Icon } from 'lucide-react'` boilerplate for the common case.

#### Scenario: Author uses an icon by name
- **WHEN** a post writes `<IconBlock icon="zap" label="Lightning fast" variant="warning" />`
- **THEN** the corresponding lucide icon renders, with no `import` statement for that icon required in the post

#### Scenario: Author passes a component reference
- **WHEN** a post writes `<IconBlock icon={Zap} ... />` with an imported `LucideIcon` component
- **THEN** it renders unchanged; the component-reference form remains supported alongside the string-name form

#### Scenario: An unknown icon name is supplied
- **WHEN** a post supplies an `icon` string that does not match any lucide icon
- **THEN** the widget degrades safely (no icon rendered / no crash), consistent with how `PigeonMap` handles an unresolved marker icon name
