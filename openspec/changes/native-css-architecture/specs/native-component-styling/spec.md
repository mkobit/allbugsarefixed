## ADDED Requirements

### Requirement: UI components use colocated CSS Modules for styling
Components in `src/components/ui/` SHALL declare styles in colocated `<component>.module.css` files.
Components SHALL apply `styles.root` and named slot classes at build time.
Components SHALL NOT use `tailwind-variants` or runtime class merging.

#### Scenario: Rendering a component with scoped styles
- **WHEN** a UI component renders in an Astro template or hydrated React island
- **THEN** it outputs build-time scoped class names without client-side styling libraries

### Requirement: Component variants are expressed through data attributes
Component variants and sizes SHALL be passed to rendered DOM elements as HTML `data-*` attributes (`data-variant`, `data-size`).
Variant options SHALL be typed with explicit TypeScript string literal unions.
Boolean variant props SHALL output an attribute when true and omit the attribute when false.

#### Scenario: Rendering a component with variant props
- **WHEN** a caller provides `variant="outline"` and `size="sm"` to a component
- **THEN** the rendered DOM element contains `data-variant="outline"` and `data-size="sm"`

### Requirement: Styles are scoped in cascade layers with flat specificity
Component rules SHALL be wrapped in `@layer components`.
Variant styling SHALL use `:where(&[data-variant="..."])` selectors and private custom properties (`--_*`).
Rules SHALL maintain a flat specificity of `(0, 1, 0)` so utilities and parent contexts can override them cleanly.

#### Scenario: Overriding component styles from outside the component
- **WHEN** an outer layout or utility class applies a style to a component element
- **THEN** the component style yields without requiring `!important` overrides

### Requirement: Component state and content adaptation use modern selectors
Interactive components SHALL use `:hover:not(:disabled)` to avoid hover styles on disabled controls.
Components with contextual children SHALL use `:has()` to adapt layout or padding based on child elements.
Components with slotted markdown content SHALL use `@scope` to prevent leaking styles into inner content.

#### Scenario: Applying state styles to interactive controls
- **WHEN** a disabled button receives cursor hover
- **THEN** `:hover:not(:disabled)` prevents the hover styles from applying
