## Why

CI (`bun run test:e2e`, per abf-0yc) only verifies the site works when served locally by Astro's preview server against the build artifact.
Nothing verifies the actual deployed URL loads and renders correctly after `deploy.yml` finishes — a broken deploy (bad asset paths, CDN propagation failure, DNS issue) currently ships silently.
This addresses abf-zdv.2's acceptance criteria: after a deploy, an automated check confirms the live site actually loads and core pages render.

## What Changes

- `playwright.config.ts` gains a `PLAYWRIGHT_BASE_URL` env-var branch: when set, tests run against that URL and the local `webServer` (Astro preview) is skipped; when unset, today's local-preview behavior is unchanged. This makes the test suite destination-agnostic — the same spec files can target a local build, GitHub Pages, or (later) Cloudflare Pages, with no test-file changes.
- `tests/e2e/` is reorganized by feature/functionality into subdirectories, replacing the current flat structure:
  - `tests/e2e/reachability/home.spec.ts` — status/title check (split out of today's `smoke.spec.ts`)
  - `tests/e2e/reachability/layout.spec.ts` — header/main render + brand CSS class check (the other half of `smoke.spec.ts`)
  - `tests/e2e/reachability/console-errors.spec.ts` — the console-error check currently commented out in `smoke.spec.ts` as flaky, given a real home (not fixed here — flakiness is separate follow-up work)
  - `tests/e2e/content/blog-links.spec.ts` — renamed from `blog_integrity.spec.ts`, unchanged logic
  - `tests/e2e/ui/scroll-progress.spec.ts` — renamed from `scroll_progress.spec.ts`, unchanged logic
- Each spec is tagged, using Playwright's native `{ tag: '@live-safe' }` / `{ tag: '@local-only' }` option (supported since v1.42; this repo runs `^1.62.0`) at `test()`/`describe()` level: `@live-safe` for reachability, `@local-only` for content and ui. `content/blog-links.spec.ts` crawls every blog link and stays `@local-only`: link validity is baked in at build time and already caught pre-merge against the local build, so running it against production would add unbounded live traffic (scaling with post count) without adding deploy-specific signal — a broken base path or asset-routing issue would already fail the reachability checks.
- New `test:e2e:live` npm script runs `playwright test --grep @live-safe`.
- `deploy.yml` gets a new step after the existing `deploy-pages` step that sets `PLAYWRIGHT_BASE_URL` to `steps.deployment.outputs.page_url` and runs `bun run test:e2e:live`. A failure fails the workflow (visible red CI run / GitHub notification); this is detection after the fact, not a deploy gate — GitHub Pages is already serving the new build by the time this step runs. On failure, the step also uploads the Playwright report/trace as a build artifact, so the failure is diagnosable without reproducing manually against the live URL.
- `reusable-check.yml`'s existing `integration-test` job continues running the full, untagged `bun run test:e2e` suite against the local build as the pre-merge gate — unchanged.

Not in scope for this change:
- A scheduled/cron synthetic check independent of deploys (extra ops overhead not justified for a low-traffic personal blog right now).
- Cloudflare-specific wiring — the env-var branch is built generically so it's ready when abf-zdv.3.2 (deferred to 2026-10-11) lands, but no Cloudflare workflow step is added here.
- Fixing the console-error check's underlying flakiness (tracked separately if needed once it has a home).

## Capabilities

### New Capabilities
- `live-deploy-verification`: post-deploy automated verification that the live production URL loads and core pages render, decoupled from any specific hosting target.

### Modified Capabilities
(none — `static-site-hosting` is not touched by this change; see Impact for a known pre-existing inconsistency in that spec, tracked separately as abf-k8c)

## Impact

- `playwright.config.ts` — add `PLAYWRIGHT_BASE_URL` branch.
- `tests/e2e/*.spec.ts` — moved/renamed/split into `reachability/`, `content/`, `ui/` subdirectories with `@live-safe`/`@local-only` tags.
- `package.json` — new `test:e2e:live` script.
- `.github/workflows/deploy.yml` — new post-deploy step.
- `.github/workflows/reusable-check.yml` — no functional change; still runs the full suite.
- Note: `openspec/specs/static-site-hosting/spec.md` currently asserts Cloudflare Pages is the production target, which doesn't match `deploy.yml`'s actual GitHub Pages target. This proposal is written against the real current target (GitHub Pages). The spec inconsistency is tracked separately as abf-k8c and not fixed here.
