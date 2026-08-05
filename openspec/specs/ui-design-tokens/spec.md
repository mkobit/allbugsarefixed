## Purpose
Define the tiering contract for the Tailwind design-token system: which recurring UI-level and component-specific semantic concepts must be backed by a `@theme` token rather than a raw Tailwind palette utility, so components can't reintroduce the raw-gray-scale/`dark:`-pair duplication this capability exists to prevent.

## Requirements

### Requirement: UI-level semantic tokens back recurring text/border/surface concepts
The design-token system SHALL define Tier-3 "UI-level" tokens in `src/styles/global.css`'s `@theme` block for styling concepts that recur across multiple components: muted text, dim/subtle text, subtle border, and hover-surface background. Each token SHALL resolve to a light-mode value under `:root` and a dark-mode value under `.dark`, following the same mechanism already used by the existing Tier-1/2 `brand-*` tokens.

#### Scenario: A component needs muted text styling
- **WHEN** a component (e.g. a timestamp or metadata label) needs de-emphasized text color
- **THEN** it applies the shared muted-text token's utility class rather than a raw Tailwind gray-scale class paired with a `dark:` variant

#### Scenario: A component needs a subtle border or hover surface
- **WHEN** a component (e.g. a table row or separator) needs a low-contrast border or a hover-state background
- **THEN** it applies the shared subtle-border or hover-surface token's utility class rather than a raw Tailwind gray-scale class paired with a `dark:` variant

### Requirement: Callout semantic states are token-backed
Each of `callout.tsx`'s four semantic states (error, info, tip, warning) SHALL be backed by dedicated tokens for its background, border, and text roles, resolving through the same `:root`/`.dark` mechanism as other tokens, instead of hardcoding a raw Tailwind color family (e.g. `red-50`, `red-900`, `red-200`, `red-800`) directly in the component.

#### Scenario: Rendering a callout in light or dark mode
- **WHEN** a `Callout` of a given `type` (error/info/tip/warning) renders
- **THEN** its background, border, and text colors come from that type's dedicated tokens, and switching between `:root` and `.dark` changes all three consistently without per-component dark-mode overrides

### Requirement: Existing visual output is preserved
Migrating a component from raw Tailwind gray-scale/semantic-color utilities to the new tokens SHALL NOT change that component's rendered color in either light or dark mode, beyond incidental adjustments needed to consolidate near-duplicate values (e.g. two components using slightly different grays for the same concept) into a single shared token.

#### Scenario: Migrating a component to a new token
- **WHEN** a component's raw utility pair (e.g. `text-gray-500 dark:text-gray-400`) is replaced with a token-backed utility class
- **THEN** the component's rendered text/border/background color is visually unchanged, verified by comparing a before/after screenshot of a page exercising that component in both light and dark mode
