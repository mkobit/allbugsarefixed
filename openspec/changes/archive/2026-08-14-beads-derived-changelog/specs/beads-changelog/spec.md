## ADDED Requirements

### Requirement: Extraction and categorization of closed beads history
The changelog data generator SHALL query closed issue entries from the beads issue tracker and categorize each closed entry into one of four categories: info, platform, testing, or authoring-tooling. The generator SHALL explicitly filter out blog post content beads to preserve focus on platform and authoring capabilities.

#### Scenario: Extraction of closed beads
- **WHEN** the changelog generation script executes against the local beads database
- **THEN** it parses closed issue records and assigns each to its corresponding category based on labels or issue metadata while excluding blog post content entries

### Requirement: Changelog page rendering
The website SHALL render a dedicated changelog view displaying shipped changes organized chronologically and grouped by category.

#### Scenario: Rendering the changelog page
- **WHEN** a user visits the changelog route
- **THEN** the site displays a page with shipped platform features, testing updates, info changes, and authoring tooling improvements
