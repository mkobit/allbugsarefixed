# Component styling and variant patterns research (`allbugsarefixed-jaq.1`)

## Objective

Evaluate internal component styling and variant patterns to replace Tailwind CSS utility classes and `tailwind-variants` across [`src/components/ui/`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/).
Select a primary authoring pattern that provides strict TypeScript variant types, zero client-side styling runtime, deterministic cascade priority, and full compatibility with Astro static rendering, React islands, and Bun unit tests.

## Current component inventory

The repository contains 15 files in [`src/components/ui/`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/) and 1 class-merging helper in [`src/lib/ui.ts`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/lib/ui.ts).
Ten components use `tv` and `VariantProps` from `tailwind-variants` (`^3.3.1`), combined with [`cn`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/lib/ui.ts#L5-L7) (`clsx` + `tailwind-merge`).

| Component file | `tv()` usage | Variant axes | Slots / special selectors | Interactive / hydrated usage |
| :--- | :--- | :--- | :--- | :--- |
| [`button.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx) | Single-element `tv()` | `variant` (`primary`, `secondary`, `outline`, `ghost`, `link`), `size` (`sm`, `md`, `lg`, `icon`), `fullWidth` (`boolean`) | Wraps `@headlessui/react` [`Button`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx#L2); uses `:hover`, `:focus`, `:disabled` | Hydrated in [`changelog-view.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/changelog-view.tsx#L98-L120) and MDX demos |
| [`badge.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/badge.tsx) | Single-element `tv()` | `variant` (`default`, `outline`, `solid`) | Static `<span>` element | Rendered in [`PostHeader.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/PostHeader.tsx#L18) and [`changelog-view.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/changelog-view.tsx#L158-L160) |
| [`callout.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/callout.tsx) | Single-element `tv()` + child elements | `type` (`info`, `warning`, `tip`, `error`) | Consumes Tier-4 `--color-callout-*` tokens; inner `.prose` wrapper | Static SSR via remark callout plugin and MDX |
| [`heading.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/heading.tsx) | Single-element `tv()` + child anchor | `level` (`1`..`6` numeric union) | Parent `.group` hover reveals `#` anchor child (`group-hover:opacity-100`) | Static SSR |
| [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx) | Multi-slot `tv({ slots })` | None (0 variant axes) | 7 slots (`wrapper`, `base`, `header`, `body`, `row`, `head`, `cell`); uses `[&_tr:last-child]:border-0`, `[&:has([role=checkbox])]:pr-0`, `data-[state=selected]` | Hydrated island (`useState` sorting with `@tanstack/react-table`) |
| [`stack.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/stack.tsx) | Single-element `tv()` | `direction` (4), `align` (5), `justify` (4), `gap` (5) | Exports [`Stack`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/stack.tsx#L47-L57), [`HStack`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/stack.tsx#L59-L61), [`VStack`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/stack.tsx#L63-L65) | Static SSR |
| [`text.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/text.tsx) | Single-element `tv()` | `size` (`xs`, `sm`, `base`, `lg`), `variant` (`default`, `muted`, `dim`, `mono`) | Polymorphic `as` prop | Static SSR |
| [`link.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/link.tsx) | Single-element `tv()` | `variant` (`default`, `nav`, `primary`, `unstyled`) | Wraps `@headlessui/react` `DataInteractive` | Static SSR and interactive contexts |
| [`time.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/time.tsx) | Single-element `tv()` | `variant` (`default`, `muted`) | Formats `Temporal.PlainDate` | Static SSR |
| [`container.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/container.tsx) | Single-element `tv()` | `size` (`sm`, `default`, `lg`, `full`) | Responsive horizontal padding and `max-width` | Static SSR |
| [`separator.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/separator.tsx) | None (raw `cn()`) | None | Single `<span>` element with [`SlashSeparator`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/separator.tsx#L10-L16) | Static SSR |
| [`ScrollProgress.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/ScrollProgress.tsx) | None (template literal) | Boolean `isVisible` state | SVG stroke dashoffset progress ring + fixed button | Hydrated island (`client:load` / `useEffect`) |
| [`changelog-view.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/changelog-view.tsx) | None (raw utility strings) | Category badge dictionary `CATEGORY_BADGES` | Composes [`Button`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx#L41-L43) and [`Badge`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/badge.tsx#L21-L23) with custom `className` overrides | Hydrated island (`useState`, `useMemo`) |
| [`PostHeader.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/PostHeader.tsx) | None (raw utility strings) | None | Composes `Badge`, `Heading`, `Stack`, `HStack`, `Time`, `SlashSeparator`, `Text` | Static SSR |
| [`PostMetadata.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/PostMetadata.tsx) | None (raw utility strings) | None | Composes `HStack`, `Text`, `lucide-react` icons | Static SSR |

### Key observations from the codebase audit

1. **Zero compound variants exist:** No component in [`src/components/ui/`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/) uses `compoundVariants` or `compoundSlots` from `tailwind-variants`.
2. **Only one component uses `slots`:** [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx#L20-L30) uses `slots` to group 7 sub-element class strings, and those slots have zero variants.
3. **Heavy client bundle overhead for simple variant selection:** Hydrated islands such as [`changelog-view.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/changelog-view.tsx) pull `tailwind-variants` and `tailwind-merge` into the client JavaScript bundle solely to concatenate static variant strings and resolve Tailwind class collisions.
4. **Bun test runner limitation with `.module.css`:** Executing `bun test src` runs in Bun's native runtime without Vite's CSS module transform.
   In Bun `1.4.3`, importing a `.module.css` file returns an empty object `{}` at runtime (`styles.button === undefined`).
   Any pattern that relies exclusively on dynamic `styles[variant]` lookups in JavaScript loses variant metadata in `bun test` assertions unless paired with semantic HTML `data-*` attributes or a custom Bun loader plugin.

## Pattern analysis

### 1. Native CSS classes (global or BEM-style)

Define component classes in standard `.css` files imported into [`src/styles/global.css`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/styles/global.css) (for example, `.ui-button`, `.ui-button--primary`, `.ui-button--sm`).

- **Pros:**
  - Zero runtime JavaScript cost.
  - Class names remain predictable in browser DevTools, Playwright E2E selectors, and `bun test` DOM assertions.
  - Works identically across `.astro` files and `.tsx` React islands.
- **Cons:**
  - Global namespace requires manual prefixing (such as `.ui-*`) to avoid selector collisions.
  - Retrieved `modern-web-guidance` (`css`) explicitly advises against BEM naming conventions to manage specificity ("Avoid introducing BEM naming conventions to manage specificity. Instead, use modern CSS features such as cascade layers and `:where()` to make cascade behavior predictable and follow author intent").
  - Requires string template concatenation in JSX (`clsx('ui-button', `ui-button--${variant}`, className)`).

### 2. CSS Modules (`.module.css`)

Colocate a `<component>.module.css` file with each React component (for example, `button.module.css` alongside [`button.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx)) and map variants via `styles[variant]`.

- **Pros:**
  - First-class support in Astro and Vite out of the box, with types declared in `node_modules/astro/client.d.ts` (`type CSSModuleClasses = { readonly [key: string]: string }`).
  - Automatic build-time class hashing eliminates class name collisions across components.
  - Vite bundles and tree-shakes CSS per page/island route automatically.
- **Cons:**
  - Standard Astro/Vite `CSSModuleClasses` typing is a loose index signature (`Record<string, string>`), so `styles.nonExistent` does not fail `tsc --noEmit` without an external codegen step.
  - Accessing multi-word or hyphenated variant names (`'column-reverse'` in [`stack.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/stack.tsx#L23)) requires bracket notation or camelCase conversion.
  - In `bun test` (Bun `1.4.3`), importing `*.module.css` evaluates to `{}` at runtime, which causes `styles[variant]` to evaluate to `undefined` during unit tests.

### 3. Data attributes (`data-variant`, `data-size`)

Pass variant props directly to the rendered HTML element as `data-*` attributes (`data-variant={variant}`, `data-size={size}`) and target them in CSS via attribute selectors (`[data-variant="primary"]`).

- **Pros:**
  - Eliminates JavaScript string concatenation and lookup maps for variants (`data-variant={variant}`).
  - Boolean variants use React's native attribute omission behavior (`data-full-width={fullWidth || undefined}` emits `data-full-width=""` when `true` and omits the attribute when `false` or `undefined`).
  - Preserves semantic variant state in the DOM for `bun test`, Playwright E2E tests, and browser DevTools regardless of CSS bundling.
  - Maps 1:1 to TypeScript union types on component props (`variant?: 'primary' | 'secondary'`).
- **Cons:**
  - Attribute selectors `[data-variant="primary"]` have specificity `(0, 1, 0)` per attribute; stacking multiple attributes increases specificity unless wrapped in `:where()` or managed inside `@layer components`.
  - Without a scoped root class (via CSS Modules or `@scope`), bare `[data-variant]` selectors could collide if nested components share attribute names.

### 4. Custom properties (CSS variables)

Define component structure once and switch visual presentation by assigning CSS custom properties (`--_bg`, `--_fg`, `--_border`, `--_padding`) per variant or inline via the `style` prop.

- **Pros:**
  - Aligns with the retrieved `modern-web-guidance` (`styling-web-components` and `css`) private alias pattern (`--_bg: var(--button-bg, var(--color-brand-primary))`), centralizing property declarations in the base rule while variants only reassign variables.
  - Eliminates property duplication across variants (for example, [`callout.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/callout.tsx#L11-L16) and [`badge.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/badge.tsx#L11-L15) only change colors/borders across variants).
  - Enables smooth transitions and dark-mode adaptation at the token level without duplicating state selectors (`:hover:not(:disabled)` is written once on the base selector using `var(--_bg-hover)`).
- **Cons:**
  - Passing dynamic variables through React's inline `style` attribute (`style={{ '--gap': gap } as React.CSSProperties}`) requires TypeScript type assertions and adds inline style serialization overhead to SSR HTML.
  - Structural layout changes (such as `display` or `flex-direction`) cannot be abstracted cleanly into token variables alone.

### 5. Modern CSS features (`@layer`, `@scope`, container style queries, `:has()`)

Use native browser cascade mechanisms to control priority, proximity scoping, and content/context adaptation.

- **`@layer` (Cascade layers — Baseline Widely Available since March 2022):**
  - Declaring `@layer reset, base, theme, components, utilities;` upfront in [`src/styles/global.css`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/styles/global.css) guarantees that component rules in `@layer components` always yield to explicit overrides in `@layer utilities` without `tailwind-merge` (`twMerge`) at runtime.
- **`:where()` and `:not()` (Baseline Widely Available):**
  - Wrapping variant filters or default resets in `:where()` keeps specificity flat at `(0, 1, 0)` (the root component class).
  - Using `:hover:not(:disabled)` (per `modern-web-guidance` `css`) prevents hover rules from overmatching disabled buttons regardless of rule ordering.
- **`:has()` (Baseline Widely Available since December 2023):**
  - Replaces Tailwind arbitrary parent selectors such as `[&:has([role=checkbox])]:pr-0` in [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx#L24-L25) with standard `&:has([role="checkbox"]) { padding-inline-end: 0; }`.
- **`@scope` (Baseline Newly Available — Chrome 118, Edge 118, Safari 17.4, Firefox 146):**
  - Provides native proximity-based scoping and donut scoping (`@scope (.callout) to (.prose)`) so container styles do not leak into nested MDX content in [`callout.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/callout.tsx#L40-L42).
  - Because `@scope` is Newly Available rather than Widely Available, using CSS Modules for primary root isolation remains safer than relying on `@scope` alone for all components.
- **`@container style()` (Container style queries — Baseline Newly Available since May 2026):**
  - Per `modern-web-guidance` (`usage-aware-component-variations`), style queries decouple contextual surfaces (`--surface: featured`) from descendant components without requiring `container-type`.
  - Best reserved for cross-component contextual adaptation (with a `:where(.context)` selector fallback) rather than direct prop-driven variants (`size="sm"`), where `data-*` attributes are simpler and universally supported.

### 6. Hybrid pattern: CSS Modules + `data-*` attributes + `@layer components` + private custom properties

Combine colocated `<component>.module.css` files (for root/slot class scoping) with `data-*` attributes (for variant props), wrapped in `@layer components` and parameterized with internal CSS custom properties (`--_*`).

- **How it works:**
  1. **Root & slot scoping:** The component imports `styles from './button.module.css'` and applies `styles.root` (plus `styles.<slot>` for multi-element components like [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx) or [`callout.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/callout.tsx)).
  2. **Variant selection:** Variant props are applied as `data-variant={variant}`, `data-size={size}`, and boolean `data-full-width={fullWidth || undefined}` on the element.
  3. **Internal token indirection:** Inside `@layer components`, `.root` defines layout and interactive states once using private custom properties (`--_bg`, `--_fg`, `--_border`), and `&[data-variant="..."]` rules reassign those variables.
  4. **Zero-dependency class merging:** [`cn()`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/lib/ui.ts#L5-L7) drops `tailwind-merge` and becomes a 3-line native helper: `inputs.filter(Boolean).join(' ')` (or `clsx` alone).

## Trade-off evaluation matrix

| Evaluation criterion | 1. Native CSS classes | 2. Pure CSS Modules (`styles[variant]`) | 3. Pure `data-*` attributes (global CSS) | 4. Pure custom properties (inline `style`) | 5. `@scope` + `@layer` (global CSS) | 6. Hybrid: CSS Modules + `data-*` + `@layer` + `--_*` (Recommended) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DX & TypeScript type-safety** | Manual string interpolation; union types must be synchronized manually with class names. | `CSSModuleClasses` is `Record<string, string>`; bracket lookups for hyphenated variants; no compile-time check on `styles[variant]`. | Clean explicit union types (`ButtonVariant`); zero JS variant mapping tables. | Verbose inline `style` casts (`as React.CSSProperties`); poor ergonomics for non-token properties. | Clean union types in TS, but global selector names require manual discipline. | Explicit TypeScript union types (`ButtonVariant`, `ButtonSize`); direct prop-to-attribute pass-through; zero lookup boilerplate. |
| **Runtime performance & bundle size** | Zero runtime CSS engine; requires string concatenation per render. | Zero runtime CSS engine; requires object property lookups per render; drops `tailwind-variants` (~5 kB) and `tailwind-merge` (~7 kB). | Zero runtime CSS engine; zero JS string interpolation for variants; drops `tailwind-variants` and `tailwind-merge`. | Zero runtime CSS engine, but serializes inline `style` objects on every render and bloats SSR HTML. | Zero runtime CSS engine; drops `tailwind-variants` and `tailwind-merge`. | **Best:** Zero JS variant resolution; removes both `tailwind-variants` and `tailwind-merge` (~12 kB min+gzip saved in hydrated islands). |
| **Astro / Vite / React SSR & hydration** | Full SSR support; global CSS loads on all pages even when a component is unused. | Automatic per-route CSS code-splitting in Vite/Astro; zero hydration mismatch risk. | Full SSR support; global CSS bundle unless manually split by page. | Inline styles serialize into SSR HTML and increase payload size. | Full SSR support; `@scope` requires Newly Available browser support (Firefox 146+). | **Best:** Vite/Astro automatically bundles and code-splits `.module.css` per route; HTML attributes hydrate deterministically. |
| **Specificity, leakage & collision resistance** | Prone to global naming collisions; BEM modifiers complicate specificity. | Hashed classes prevent collisions; combining multiple modifier classes relies on CSS source order. | Unscoped `[data-variant]` selectors risk matching nested children unless carefully qualified. | Inline styles have high specificity (`1,0,0,0`), making external overrides difficult. | `@layer` + `@scope` handles proximity well, but root class names remain global. | **Best:** Hashed `.root` prevents collisions; `@layer components` + `:where()` keeps specificity flat and overridable by consumers. |
| **Migration ergonomics & testability (`bun test` + E2E)** | Works in `bun test`, but requires rewriting all JSX class expressions. | **Breaks variant assertions in `bun test`** because Bun `1.4.3` returns `{}` for `.module.css` imports. | Works in `bun test` and Playwright via `[data-variant="..."]` selectors. | Harder to assert computed styles in JSDOM/Bun unit tests. | Works in `bun test` and Playwright. | **Best:** `data-variant` and `data-size` remain intact in `bun test` DOM assertions and Playwright E2E tests while Vite scopes `.root` in builds. |

## Deep-dive trade-off analysis

### 1. Developer experience and TypeScript type-safety without heavy runtime libraries

`tailwind-variants` provides `VariantProps<typeof styles>`, which infers prop types from a runtime JavaScript configuration object.
Under the hybrid pattern, TypeScript types are declared directly as string literal unions (or `as const` arrays when runtime iteration is needed, such as in tests or documentation galleries):

```ts
export type ButtonVariant = 'ghost' | 'link' | 'outline' | 'primary' | 'secondary'
export type ButtonSize = 'icon' | 'lg' | 'md' | 'sm'
```

Declaring explicit union types provides three concrete advantages over `VariantProps<typeof tv(...)>`:
1. **Faster TypeScript checking (`astro check && tsc --noEmit`):** The compiler checks flat union types instead of evaluating deeply nested generic conditional types from `tailwind-variants`.
2. **Cleaner IDE hover signatures:** Hovering over `<Button variant="..." />` displays `'ghost' | 'link' | 'outline' | 'primary' | 'secondary'` instead of an opaque `VariantProps` alias.
3. **ESLint compliance:** Avoids large nested variant configuration objects that require manual alphabetical sorting under this repository's `sort-keys: ['error', 'asc']` rule in [`eslint.config.mjs`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/eslint.config.mjs#L67).

### 2. Runtime performance, bundle size, and `cn()` simplification

Currently, [`src/lib/ui.ts`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/lib/ui.ts) runs `twMerge(clsx(inputs))` on every component render.
`tailwind-merge` parses class strings at runtime to resolve atomic utility conflicts (such as `px-3` vs `px-4` in [`button.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx#L8-L24)).
When component styles move to native CSS inside `@layer components`, atomic class conflicts no longer exist.
[`src/lib/ui.ts`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/lib/ui.ts) can be reduced to:

```ts
export function cn(...inputs: readonly (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
```

This removes `tailwind-variants`, `tailwind-merge`, and `clsx` from the client bundle of hydrated React islands ([`changelog-view.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/changelog-view.tsx), [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx), [`ScrollProgress.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/ScrollProgress.tsx)).

### 3. Specificity management, cascade layers, and collision resistance

Following the retrieved `modern-web-guidance` (`css` and `styling-web-components`), the global stylesheet [`src/styles/global.css`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/styles/global.css) should declare an explicit cascade layer order at the top of the file:

```css
@layer reset, base, theme, components, utilities;
```

Inside each `<component>.module.css` file:
- Wrap all component rules in `@layer components { ... }`.
- Define private custom properties (`--_bg`, `--_fg`, `--_border`, `--_ring`) on `.root` so that state rules (`&:hover:not(:disabled)`, `&:focus-visible`) are written once.
- Use `:where(&[data-variant="..."])` or flat `&[data-variant="..."]` selectors inside `.root` so variant rules have predictable specificity `(0, 1, 0)` or `(0, 2, 0)` within `@layer components`.
- Any custom `className` passed by a consumer in `@layer utilities` or unlayered CSS automatically overrides `@layer components` without `!important` or `twMerge`.
- For container components that render arbitrary MDX children (such as [`callout.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/callout.tsx#L40-L42)), use `@scope (.root) to (.content)` as a progressive enhancement or scope structural rules to direct child slot classes (`.icon`, `.body`, `.title`) so callout styles never leak into nested MDX elements.

### 4. Handling all 15 components in `src/components/ui/`

- **Single-element variant components (`button`, `badge`, `text`, `link`, `time`, `container`, `stack`):** Migrate directly to `<component>.module.css` + `data-*` attributes.
- **Multi-element / slot components (`callout`, `heading`, `table`, `ScrollProgress`, `changelog-view`, `PostHeader`, `PostMetadata`):** Use scoped classes in `<component>.module.css` for internal slots (for example, `styles.wrapper`, `styles.table`, `styles.row`, `styles.cell` in [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx)) instead of `tv({ slots })`.
- **Content-driven styling in [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx#L24-L25):** Replace `[&:has([role=checkbox])]:pr-0` with native CSS `:has()` per `modern-web-guidance` (`content-based-styling`):
  ```css
  .cell:has([role="checkbox"]),
  .head:has([role="checkbox"]) {
    padding-inline-end: 0;
  }
  ```
- **Child hover reveal in [`heading.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/heading.tsx#L29-L39):** Replace Tailwind's `group` and `group-hover:opacity-100` with native CSS nesting inside `heading.module.css`:
  ```css
  .root:hover .anchor {
    opacity: 1;
  }
  ```

## Concrete migration prototypes

### Prototype 1: `button.tsx` and `button.module.css`

#### [`src/components/ui/button.module.css`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx) (new file prototype)

```css
@layer components {
  .root {
    --_bg: var(--color-brand-primary);
    --_bg-hover: color-mix(in oklab, var(--color-brand-primary) 90%, transparent);
    --_fg: #fff;
    --_border: transparent;
    --_ring: var(--color-brand-primary);
    --_py: 0.5rem;
    --_px: 0.75rem;
    --_font-size: 0.875rem;
    --_line-height: 1.25rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--_border);
    padding-block: var(--_py);
    padding-inline: var(--_px);
    font-size: var(--_font-size);
    line-height: var(--_line-height);
    font-weight: 600;
    background-color: var(--_bg);
    color: var(--_fg);
    cursor: pointer;
    transition-property: color, background-color, border-color;
    transition-duration: 150ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

    &:hover:not(:disabled) {
      background-color: var(--_bg-hover);
    }

    &:focus-visible {
      outline: 2px solid var(--_ring);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Variants */
    &:where([data-variant="secondary"]) {
      --_bg: var(--color-brand-secondary);
      --_bg-hover: color-mix(in oklab, var(--color-brand-secondary) 90%, transparent);
      --_fg: #fff;
      --_ring: var(--color-brand-secondary);
    }

    &:where([data-variant="outline"]) {
      --_bg: transparent;
      --_bg-hover: var(--color-ui-surface-hover);
      --_fg: var(--color-brand-text);
      --_border: var(--color-ui-border-strong);
      --_ring: var(--color-ui-text-muted);
    }

    &:where([data-variant="ghost"]) {
      --_bg: transparent;
      --_bg-hover: var(--color-ui-surface-hover);
      --_fg: var(--color-brand-text);
      --_ring: var(--color-ui-text-muted);
    }

    &:where([data-variant="link"]) {
      --_bg: transparent;
      --_bg-hover: transparent;
      --_fg: var(--color-brand-primary);
      --_py: 0;
      --_px: 0;
      block-size: auto;
      text-underline-offset: 4px;

      &:hover:not(:disabled) {
        text-decoration-line: underline;
      }
    }

    /* Sizes */
    &:where([data-size="sm"]) {
      --_py: 0.25rem;
      --_px: 0.5rem;
      --_font-size: 0.75rem;
      --_line-height: 1rem;
    }

    &:where([data-size="lg"]) {
      --_py: 0.625rem;
      --_px: 1rem;
      --_font-size: 1rem;
      --_line-height: 1.5rem;
    }

    &:where([data-size="icon"]) {
      --_py: 0;
      --_px: 0;
      inline-size: 2.25rem;
      block-size: 2.25rem;
    }

    /* Boolean modifiers */
    &:where([data-full-width]) {
      inline-size: 100%;
    }
  }
}
```

#### [`src/components/ui/button.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/button.tsx) (migrated prototype)

```tsx
import React from 'react'
import { Button as HeadlessButton } from '@headlessui/react'
import { cn } from '../../lib/ui'
import styles from './button.module.css'

export type ButtonVariant = 'ghost' | 'link' | 'outline' | 'primary' | 'secondary'
export type ButtonSize = 'icon' | 'lg' | 'md' | 'sm'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly asChild?: boolean
  readonly fullWidth?: boolean
  readonly size?: ButtonSize
  readonly variant?: ButtonVariant
}

export function Button({
  className,
  fullWidth = false,
  size = 'md',
  variant = 'primary',
  ...props
}: Readonly<ButtonProps>) {
  return (
    <HeadlessButton
      className={cn(styles.root, className)}
      data-full-width={fullWidth || undefined}
      data-size={size}
      data-variant={variant}
      {...props}
    />
  )
}
```

### Prototype 2: `badge.tsx` and `badge.module.css`

#### [`src/components/ui/badge.module.css`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/badge.tsx) (new file prototype)

```css
@layer components {
  .root {
    --_bg: transparent;
    --_fg: var(--color-brand-primary);
    --_border: transparent;
    --_px: 0;
    --_py: 0;
    --_radius: 0;

    display: inline-flex;
    align-items: center;
    border-radius: var(--_radius);
    border: 1px solid var(--_border);
    padding-inline: var(--_px);
    padding-block: var(--_py);
    background-color: var(--_bg);
    color: var(--_fg);
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 700;
    letter-spacing: 0.025em;
    text-transform: uppercase;

    &:where([data-variant="outline"]) {
      --_border: currentColor;
      --_px: 0.5rem;
      --_py: 0.125rem;
      --_radius: calc(infinity * 1px);
    }

    &:where([data-variant="solid"]) {
      --_bg: var(--color-brand-primary);
      --_fg: #fff;
      --_px: 0.5rem;
      --_py: 0.125rem;
      --_radius: calc(infinity * 1px);
    }
  }
}
```

#### [`src/components/ui/badge.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/badge.tsx) (migrated prototype)

```tsx
import React from 'react'
import { cn } from '../../lib/ui'
import styles from './badge.module.css'

export type BadgeVariant = 'default' | 'outline' | 'solid'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: Readonly<BadgeProps>) {
  return (
    <span
      className={cn(styles.root, className)}
      data-variant={variant}
      {...props}
    />
  )
}
```

## Recommendation

Adopt **Pattern 6 (Hybrid: CSS Modules + `data-*` attributes + `@layer components` + private CSS custom properties `--_*`)** for all components in [`src/components/ui/`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/).

1. **Colocate `<component>.module.css` with each component** and apply `styles.root` (and `styles.<slot>` for multi-element components) to scope selectors at build time via Vite/Astro.
2. **Express component variants via `data-*` attributes** (`data-variant`, `data-size`, `data-full-width={fullWidth || undefined}`) typed with explicit TypeScript string literal unions.
3. **Wrap component styles in `@layer components`** and use `:where(&[data-variant="..."])` plus private custom properties (`--_bg`, `--_fg`, `--_border`) to eliminate rule duplication and keep specificity flat.
4. **Use modern CSS selectors for internal state and content adaptation:**
   - `:hover:not(:disabled)` to prevent overmatching disabled controls.
   - `:has()` for content-conditional layout (such as checkbox cells in [`table.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/table.tsx)).
   - `@scope (.root) to (.content)` where container styles must not leak into slotted MDX content ([`callout.tsx`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/callout.tsx)).
5. **Remove `tailwind-variants` and `tailwind-merge`** once all 10 `tv()` components in [`src/components/ui/`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/components/ui/) are migrated, and simplify [`cn()`](file:///home/mkobit/workspace/mkobit/allbugsarefixed/src/lib/ui.ts#L5-L7) to join truthy class strings natively.
