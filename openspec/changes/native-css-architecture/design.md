## Context

Styling in this repository currently depends on Tailwind CSS v4, `tailwind-variants`, `@tailwindcss/typography`, and `tailwind-merge`.
An audit across `src/components/ui/`, layout components in `src/components/`, and article templates revealed significant framework coupling:
1. Ten of 15 UI components use `tv()` and `VariantProps` to concatenate utility classes.
2. Hydrated React islands pull `tailwind-variants` and `tailwind-merge` into client JavaScript bundles solely to resolve class conflicts.
3. Long-form article formatting depends on `@tailwindcss/typography`, which generates 698 utility classes (~22 kB) and requires defensive `!important` overrides in code blocks.
4. Interactive widgets use JavaScript scroll listeners and `@headlessui/react` to emulate capabilities now available natively in browsers.
5. In Bun 1.4.3, importing `*.module.css` files during `bun test` returns an empty object `{}`.

This design synthesizes the findings and prototypes from research tasks `allbugsarefixed-jaq.1` through `allbugsarefixed-jaq.5` into a unified native CSS architecture.

## Goals / non-goals

**Goals:**
- Replace `tailwind-variants` and utility classes across `src/components/ui/` with colocated CSS Modules and HTML `data-*` attributes.
- Replace `@tailwindcss/typography` with an internal `@layer typography` stylesheet (`src/styles/typography.css`) using `:where()` selectors and fluid sizing.
- Migrate design tokens to native CSS custom properties with `src/lib/tokens.gen.ts` TypeScript codegen and automated CI validation.
- Modernize layout components with container queries (`@container`), CSS subgrid, `:has()` selectors, CSS scroll timelines, HTML `<dialog>`, and Popover API.
- Introduce automated build verification (`scripts/verify-css.ts`) and ESLint rules to prevent styling regressions.
- Eliminate external styling dependencies (`tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`, `tailwind-variants`, `tailwind-merge`).

**Non-Goals:**
- Redesigning site visuals or changing brand colors: existing visual presentation, light/dark values, and responsive layouts are preserved.
- Rewriting application data flow, routing in Astro, or post markdown schemas.
- Adopting external CSS-in-JS runtimes or heavy third-party CSS frameworks.
- Rewriting table sorting logic in TanStack Table.

## Decisions

### Decision 1: Colocate CSS Modules with HTML `data-*` variant attributes
Components in `src/components/ui/` use colocated `<component>.module.css` stylesheets with root and slot class names (`styles.root`).
Variants and sizes are passed to the DOM as HTML attributes (`data-variant={variant}`, `data-size={size}`) with TypeScript string literal union types.
- **Rationale**: Eliminates JavaScript runtime overhead in hydrated islands. Preserves variant state in DOM trees during `bun test` unit tests and Playwright E2E tests.
- **Alternatives considered**:
  - Global BEM classes: Rejected because manual class prefixes are prone to collisions, and modern CSS guidelines advise using cascade layers over BEM.
  - Pure CSS Modules dynamic lookups (`styles[variant]`): Rejected because Bun 1.4.3 evaluates CSS modules to `{}` during `bun test`, breaking variant assertions.

### Decision 2: Cascade layers for deterministic priority
Declare `@layer reset, base, theme, typography, components, utilities;` in `src/styles/global.css`.
- **Rationale**: Establishes strict cascade tiers. Component styles in `@layer components` yield predictably to outer utilities and layouts without specificity wars or `!important`.
- **Alternatives considered**: Unlayered stylesheets with selector specificity tricks. Rejected as brittle and prone to specificity escalation.

### Decision 3: Private CSS custom properties (`--_*`) for variant mutations
Component styles declare structural CSS properties once on the base selector and assign private variables (`--_bg`, `--_fg`, `--_border`, `--_px`, `--_py`). Variant rules under `:where(&[data-variant="..."])` reassign only the variables.
- **Rationale**: Keeps variant selectors concise and prevents property duplication. Maintains flat specificity `(0, 1, 0)`.
- **Alternatives considered**: Redefining full CSS declarations for every variant. Rejected due to code duplication and maintenance friction.

### Decision 4: Native `@layer typography` with `:where()` and fluid units
Author `src/styles/typography.css` inside `@layer typography`.
Wrap child element selectors in `:where()` (for example, `.article-prose :where(h1, h2, h3, p, a)`).
- **Rationale**: Reduces specificity to zero on nested tags so embedded widgets and React islands retain their own styles without style leakage. Eliminates ~22 kB of unused utility CSS and defensive `!important` resets in `CodeBlock.tsx`.
- **Alternatives considered**: Markdown AST visitor injecting utility classes on every node. Rejected due to AST processing overhead and build complexity.

### Decision 5: TypeScript token codegen (`tokens.gen.ts`) with `tokens:check` CI gate
Run `scripts/generate-tokens.ts` to parse `src/styles/global.css` and generate `src/lib/tokens.gen.ts`.
Provide static color extraction via `getStaticTokenColor()` for chart and SVG components in `src/lib/theme.ts`.
- **Rationale**: Single source of truth in CSS, compile-time autocomplete in TypeScript, and automated drift detection in CI via `bun run tokens:check`.
- **Alternatives considered**: Maintaining tokens in JSON/TypeScript and exporting to CSS. Rejected because CSS custom properties are the native browser primitive and support live browser editing.

### Decision 6: Container queries and subgrid for modular layouts
Use `container-type: inline-size` on parent containers and `@container` queries on responsive widgets (`BlogCard`, `Gallery`, `Footer`).
Apply `grid-template-rows: subgrid` on multi-column card items.
- **Rationale**: Components adapt to the width of their layout slot (sidebar, column, full-width) rather than screen width. Subgrid aligns titles, descriptions, and footers across adjacent cards without JavaScript height calculation.
- **Alternatives considered**: Screen viewport media queries (`@media`). Rejected because they break when components move to different column widths.

### Decision 7: Native `<dialog>` and Popover API for interactive overlays
Migrate `Lightbox.tsx` to HTML `<dialog>` with `@starting-style` transitions.
Migrate `Search.tsx` to the HTML Popover API (`popover="auto"`).
- **Rationale**: The browser manages top-layer stacking, focus trapping, and light dismissal natively. Eliminates `@headlessui/react` bundle overhead and blur timeout hacks.
- **Alternatives considered**: Retaining `@headlessui/react`. Rejected because native browser APIs supersede third-party overlay libraries.

### Decision 8: Zero-dependency CSS validation script (`scripts/verify-css.ts`)
Implement `scripts/verify-css.ts` to scan CSS files and verify custom property references against `src/lib/tokens.gen.ts`.
Add ESLint `no-restricted-syntax` rule to forbid raw hex and RGB literals in JSX/TSX.
- **Rationale**: Executes in milliseconds in Bun without external dependencies, avoiding supply chain risks and `minimumReleaseAge` constraints from large linter plugin suites.
- **Alternatives considered**: Stylelint with multiple plugins. Rejected due to dependency weight, parser maintenance, and package age constraints.

### Dependency additions and exceptions
No new external runtime dependencies are introduced.
Dev dependencies may optionally include `eslint-plugin-css-modules-next` for CSS module validation if compliant with `minimumReleaseAge` in `bunfig.toml`.
If blocked by package age policies, validation will remain inside `scripts/verify-css.ts`.

## Risks / trade-offs

- **[Risk]** Bun unit tests do not evaluate `.module.css` files at runtime.
  → **Mitigation**: Components expose variant state on HTML `data-*` attributes (`data-variant`, `data-size`). Unit tests assert on DOM attributes rather than computed styles.
- **[Risk]** Potential typography rendering discrepancies during migration from `@tailwindcss/typography`.
  → **Mitigation**: `src/styles/typography.css` provides a backward-compatibility `.prose` class alias. Visual regression is verified using Playwright screenshots across light and dark modes.
- **[Risk]** Subgrid and `@starting-style` browser support on older browser engines.
  → **Mitigation**: Both features are Baseline Widely Available or Baseline Newly Available across modern evergreen browsers. Standard fallback declarations are included where appropriate.
- **[Trade-off]** Hand-authored CSS modules require more lines of CSS than inline Tailwind utility classes.
  → **Mitigation**: The CSS is colocated, modular, and scoped at build time. The architecture eliminates 5 external dependencies and reduces client bundle sizes.

## Adversarial review and mitigations

- **Objection: "Why remove Tailwind CSS v4 from a functioning site instead of keeping utility classes?"**
  - **Mitigation**: Tailwind CSS v4 couples the build pipeline to external compiler plugins, prevents direct use of container queries and subgrid in component JSX, and forces client-side class merging libraries into hydrated React islands. Removing Tailwind simplifies the build pipeline, reduces client bundle weight, and leverages standard web platform primitives.
- **Objection: "Why implement a custom verification script (`scripts/verify-css.ts`) instead of standard Stylelint?"**
  - **Mitigation**: Stylelint and its associated PostCSS plugins require numerous packages that risk violating the project's `minimumReleaseAge` policy in `bunfig.toml`. A zero-dependency TypeScript script runs in <50ms, parses token references directly, and verifies them against the generated `tokens.gen.ts` contract without external dependency debt.
- **Objection: "Will migrating Lightbox from Headless UI to native `<dialog>` break keyboard accessibility?"**
  - **Mitigation**: The native HTML `<dialog>` element provides built-in browser-level accessibility: automatic focus containment, `Escape` key dismissal, and accessibility tree exposure. It is more standard and accessible than custom JavaScript focus traps.
- **Objection: "What if an engineer writes an undeclared CSS variable or raw color in a component?"**
  - **Mitigation**: Automated checks in CI enforce these rules: `bun run verify:css` verifies token names against `tokens.gen.ts`, `bun run lint` catches raw color literals in JSX/TSX via ESLint AST queries, and `bun run tokens:check` prevents token drift.

## Migration plan

The migration proceeds incrementally across distinct phases:

1. **Phase 1: Build verification and validation infrastructure**
   - Create `scripts/verify-css.ts` and add `bun run verify:css` to `package.json` and CI workflows.
   - Add ESLint AST rule to ban raw color literals in JSX/TSX files.
   - Ensure `bun run tokens:check` passes in CI.
2. **Phase 2: Native article typography stylesheet**
   - Author `src/styles/typography.css` with `@layer typography`, `:where()` selectors, and `.article-prose`.
   - Update `src/pages/blog/[...slug].astro` and `src/pages/about.astro` to use `.article-prose`.
   - Remove `!important` utility overrides from `CodeBlock.tsx` and clean up `callout.tsx`.
   - Remove `@tailwindcss/typography` plugin and dependency.
3. **Phase 3: Component migration in `src/components/ui/`**
   - Migrate components to colocated `.module.css` files and `data-*` attributes one component at a time (`badge.tsx`, `button.tsx`, `callout.tsx`, `heading.tsx`, `table.tsx`, `stack.tsx`, `text.tsx`, `link.tsx`, `time.tsx`, `container.tsx`, `separator.tsx`, `changelog-view.tsx`).
   - Remove `tailwind-variants` and `tailwind-merge` dependencies.
   - Simplify `cn()` in `src/lib/ui.ts` to concatenate truthy class strings.
4. **Phase 4: Modern layout and widget enhancements**
   - Migrate `ScrollProgress.tsx` to CSS scroll-driven animations in a static Astro component.
   - Refactor `BlogCard.tsx` and blog post grid to use CSS subgrid and container queries.
   - Migrate `Lightbox.tsx` to native `<dialog>` with `@starting-style`.
   - Migrate `Search.tsx` to HTML Popover API.
5. **Phase 5: Final compiler cleanup**
   - Remove `@theme` block from `src/styles/global.css`.
   - Remove `@tailwindcss/vite` and `tailwindcss` packages.
   - Enable Lightning CSS in `astro.config.mjs` for minification and syntax lowering.
   - Run complete verification: `bun run verify`, `bun run build`, and `bun run test:e2e`.

## Open questions

None. All technical choices were prototyped and validated in research tasks `allbugsarefixed-jaq.1` through `allbugsarefixed-jaq.5`.
