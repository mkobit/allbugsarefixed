## Why

Manual changelogs are tedious to maintain and easily get out of sync with actual shipped work.
Deriving a changelog directly from closed beads issues provides an automated, accurate record of platform improvements, tooling updates, and test suite enhancements.

## What Changes

- Add a script and data pipeline to query closed beads issues from issue history.
- Map closed beads issues into structured changelog categories (info, platform, testing, authoring tooling).
- Exclude blog post content beads to focus exclusively on platform and authoring capabilities.
- Render a release changelog page on the website displaying shipped features grouped by category and release/date.

## Capabilities

### New Capabilities
- `beads-changelog`: Generation and rendering of release changelogs derived from closed beads issue history.

### Modified Capabilities

## Impact

- `src/pages/changelog.astro` (or similar new route) for displaying the rendered changelog.
- `src/lib/` or `scripts/` for beads history extraction and categorization logic.
- `src/components/ui/` for React UI components rendering changelog categories and entries.
- Build and validation pipeline to ensure changelog generation passes lint and typecheck.
