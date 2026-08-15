<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=beads-derived-changelog
  Note: Manually add label meta:openspec:beads-derived-changelog to the poured Expand Tasks bead and all child task beads.
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Extraction and generation data pipeline

- [x] 1.1 Create `scripts/generate-changelog.ts` to query closed beads, parse entries, apply categorization, and write `src/data/changelog.json`. Validation: `bun scripts/generate-changelog.ts` creates valid JSON file.
- [x] 1.2 Add npm script `changelog:generate` to `package.json`. Validation: `bun run changelog:generate` exits with code 0.

## 2. UI components and route

- [x] 2.1 Create `src/components/ui/changelog-view.tsx` to display categorized release logs. Validation: `bun run typecheck` and `bun run lint` pass cleanly.
- [x] 2.2 Create Astro page `src/pages/changelog.astro` to serve the `/changelog` route. Validation: `bun run build` produces `dist/changelog/index.html`.

## 3. Verification and testing

- [x] 3.1 Add E2E tests in `tests/e2e/` verifying `/changelog` renders categories and entries. Validation: `bun run test:e2e` passes.
- [x] 3.2 Verify full CI pipeline. Validation: `mise run check` passes all 8 CI checks cleanly.
