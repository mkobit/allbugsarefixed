<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=live-deploy-verification
  Note: Manually add label meta:openspec:live-deploy-verification to the poured Expand Tasks bead and all child task beads.
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Destination-agnostic Playwright config

- [ ] 1.1 Add a `PLAYWRIGHT_BASE_URL` env-var branch to `playwright.config.ts`: when set, use it as `baseURL` and omit the `webServer` block entirely; when unset, keep today's local-preview `baseURL`/`webServer` behavior unchanged.
  Validation: `bun run test:e2e` still passes locally with the var unset (unchanged local behavior); `PLAYWRIGHT_BASE_URL=http://localhost:<port> bun run test:e2e` against a manually-started `bun run preview` passes without Playwright attempting to spawn a second server.

## 2. Reorganize and re-tag e2e specs

- [ ] 2.1 Create `tests/e2e/reachability/home.spec.ts`: split out the title/status assertion from today's `smoke.spec.ts`, wrapped in `test.describe('...', { tag: '@live-safe' }, ...)`.
  Validation: `bun run test:e2e` passes; test name makes clear on failure that this is a reachability check.
- [ ] 2.2 Create `tests/e2e/reachability/layout.spec.ts`: split out the header/main visibility and brand Tailwind class assertions from today's `smoke.spec.ts`, tagged `@live-safe`.
  Validation: `bun run test:e2e` passes.
- [ ] 2.3 Create `tests/e2e/reachability/console-errors.spec.ts`: give the console-error check (currently commented out in `smoke.spec.ts`) its own file and tag `@live-safe`, kept as-is (do not attempt to fix its flakiness in this task — file a follow-up bead if it turns out to be needed).
  Validation: file exists, is tagged, and either passes or is explicitly skipped with a comment referencing the known flakiness — not silently dropped.
- [ ] 2.4 Delete `tests/e2e/smoke.spec.ts` once 2.1–2.3 cover its assertions.
  Validation: `rg smoke.spec` in `tests/e2e/` returns nothing.
- [ ] 2.5 Move `tests/e2e/blog_integrity.spec.ts` to `tests/e2e/content/blog-links.spec.ts`, tagged `@local-only`, logic unchanged.
  Validation: `bun run test:e2e` passes.
- [ ] 2.6 Move `tests/e2e/scroll_progress.spec.ts` to `tests/e2e/ui/scroll-progress.spec.ts`, tagged `@local-only`, logic unchanged.
  Validation: `bun run test:e2e` passes.
- [ ] 2.7 Confirm `bun run test:e2e` (untagged, full suite) still runs all 5 specs against the local build, matching today's coverage.
  Validation: Playwright's summary output reports 5 passed tests (or the equivalent count if a spec has multiple `test()` blocks) with zero skipped/failed.

## 3. Live-verification wiring

- [ ] 3.1 Add `test:e2e:live` script to `package.json`: `playwright test --grep @live-safe`.
  Validation: `bun run test:e2e:live` runs against a manually-started local preview (`PLAYWRIGHT_BASE_URL` set, per 1.1) and only executes the 3 `@live-safe` specs from `reachability/`.
- [ ] 3.2 Add a post-deploy step to `.github/workflows/deploy.yml`, after the existing `deploy-pages` step, setting `PLAYWRIGHT_BASE_URL: ${{ steps.deployment.outputs.page_url }}` and running `bun run test:e2e:live` (install Bun/Playwright browsers as needed for this job, matching the pattern in `reusable-check.yml`'s `integration-test` job).
  Validation: workflow YAML lints/parses; a manual `workflow_dispatch` run (or the next push to `main`) shows the new step executing after deploy and passing against the live URL.
- [ ] 3.3 Add `if: failure()` artifact upload of the Playwright HTML report and trace in the new deploy.yml step.
  Validation: intentionally break a `@live-safe` assertion locally, confirm the upload step's `actions/upload-artifact` config targets the correct `playwright-report/` path (dry-run/lint the YAML; full failure-path verification happens on first real CI failure).

## 4. Verification and cleanup

- [ ] 4.1 Run the full CI gate locally per `AGENTS.md`: `bun scripts/verify-versions.ts`, `bun run lint`, `bun run openspec:validate`, `bun run typecheck`, `bun run test`, `bun run coverage`, `bun run build`, `bun run test:e2e`.
  Validation: all 8 commands pass with no new failures.
- [ ] 4.2 Confirm no remaining references to the old flat test file names (`smoke.spec.ts`, `blog_integrity.spec.ts`, `scroll_progress.spec.ts`) anywhere in the repo.
  Validation: `rg -n "smoke\.spec|blog_integrity|scroll_progress"` returns nothing outside `openspec/changes/live-deploy-verification/` (the planning artifacts themselves, which reference the old names historically).
- [ ] 4.3 Open a PR per this repo's required workflow (no direct commits to `main`).
  Validation: PR opened, CI green including the existing `reusable-check.yml` full suite.
