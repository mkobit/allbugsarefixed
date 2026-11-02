## MODIFIED Requirements

### Requirement: UI-level semantic tokens back recurring text/border/surface concepts
The design-token system SHALL define Tier-3 "UI-level" tokens in `src/styles/global.css` as native CSS custom properties for styling concepts that recur across multiple components: muted text, dim text, subtle border, and hover-surface background. Each token SHALL resolve to a light-mode value and a dark-mode value via `:root`/`.dark` or `light-dark()`, and be available via CSS custom properties and `src/lib/tokens.gen.ts`.

#### Scenario: A component needs muted text styling
- **WHEN** a component needs de-emphasized text color
- **THEN** it applies the shared muted-text custom property rather than a hardcoded color value

#### Scenario: A component needs a subtle border or hover surface
- **WHEN** a component needs a low-contrast border or a hover-state background
- **THEN** it applies the shared subtle-border or hover-surface custom property rather than a hardcoded color value

### Requirement: Callout semantic states are token-backed
Each of `callout.tsx`'s four semantic states (error, info, tip, warning) SHALL be backed by dedicated tokens for its background, border, and text roles, resolving through the token architecture instead of hardcoding a raw color family directly in the component.

#### Scenario: Rendering a callout in light or dark mode
- **WHEN** a `Callout` of a given `type` (error/info/tip/warning) renders
- **THEN** its background, border, and text colors come from dedicated tokens, and theme changes adapt all three consistently without per-component overrides

### Requirement: Existing visual output is preserved
Migrating a component from Tailwind utilities to native CSS tokens SHALL NOT change that component's rendered color in either light or dark mode, beyond incidental adjustments needed to consolidate near-duplicate values into a single shared token.

#### Scenario: Migrating a component to a new token
- **WHEN** a component's utility class is replaced with a token-backed custom property
- **THEN** the component's rendered text, border, or background color is visually unchanged
