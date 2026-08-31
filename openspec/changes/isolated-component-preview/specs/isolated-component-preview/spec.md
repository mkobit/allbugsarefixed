## ADDED Requirements

### Requirement: Isolated component preview harness
The system SHALL provide an isolated preview harness capable of mounting and rendering individual React components and Astro UI widgets outside the context of a full blog post page.

#### Scenario: Render a React component in isolation
- **WHEN** the preview harness is requested with a target component and props
- **THEN** the harness renders the component in isolation with default layout styles applied

#### Scenario: Render a component with theme variation
- **WHEN** the preview harness is requested with a specific theme mode (light or dark)
- **THEN** the harness applies the corresponding theme attribute or class so tokens render correctly

#### Scenario: Render a component across responsive viewports
- **WHEN** the preview harness renders a component
- **THEN** the component adjusts according to specified viewport width constraints

### Requirement: Component fixture and variant definitions
The system SHALL support defining component fixtures that declare sample props, states, and variants for visual previewing and automated testing.

#### Scenario: Load declared fixture variants
- **WHEN** the preview harness inspects a component fixture definition
- **THEN** it exposes all declared variants for interactive preview and automated testing

### Requirement: Exclude preview harness from production builds
The system SHALL ensure that preview routes, harness files, and test fixture definitions are excluded from the production build output.

#### Scenario: Production build execution
- **WHEN** `bun run build` is executed
- **THEN** no preview pages, fixture endpoints, or test-only assets are included in `dist/`
