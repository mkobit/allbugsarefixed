## ADDED Requirements

### Requirement: Automated build verification validates design token usage
The repository SHALL provide a validation script (`scripts/verify-css.ts`) executed via `bun run verify:css`.
The script SHALL check that CSS variable references resolve to declared tokens in `src/lib/tokens.gen.ts`.
The script SHALL fail CI if an undeclared token variable is referenced.

#### Scenario: Running CSS verification against valid token references
- **WHEN** `bun run verify:css` checks stylesheets that reference declared tokens
- **THEN** the script exits with status code 0 and reports success

### Requirement: Linting prohibits raw color literals in component code
Static analysis in `eslint.config.mjs` SHALL flag raw hexadecimal, `rgb()`, or `hsl()` color literals in JSX and TSX files.
Component authors SHALL consume design tokens through CSS custom properties or `src/lib/tokens.gen.ts`.
Direct hardcoding of palette color literals in UI components SHALL be rejected.

#### Scenario: Authoring a component with a raw color literal
- **WHEN** a component file contains a raw `#hex` string in styling markup
- **THEN** `bun run lint` reports a lint violation and fails verification

### Requirement: Design token definitions are kept in sync with generated types
The command `bun run tokens:check` SHALL verify that `src/lib/tokens.gen.ts` matches token definitions in `src/styles/global.css`.
Pull requests that modify token definitions without committing updated types SHALL fail validation.
The token generator SHALL support static color extraction for non-CSS contexts.

#### Scenario: Verifying token generator synchronization
- **WHEN** design tokens in `src/styles/global.css` are modified without running `bun run tokens:gen`
- **THEN** `bun run tokens:check` exits with an error code and reports token discrepancies
