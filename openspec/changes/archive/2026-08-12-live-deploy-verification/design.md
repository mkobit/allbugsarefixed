## Context

`deploy.yml` builds and deploys the site to GitHub Pages on every push to `main`.
The only verification that runs is `reusable-check.yml`'s `integration-test` job, which runs `bun run test:e2e` (Playwright) against a locally spawned `bun run preview` server serving the build artifact — never against the actual deployed URL.
`playwright.config.ts` hardcodes this: `baseURL` is always `http://localhost:<port>` and `webServer` always spawns `bun run preview`.
The three existing spec files (`smoke.spec.ts`, `blog_integrity.spec.ts`, `scroll_progress.spec.ts`) all navigate with relative paths (`page.goto('/')`) and make relative requests (`page.request.get(href)`), so none of them assume `localhost` specifically — the destination is entirely determined by `playwright.config.ts`'s `baseURL`.

Hosting is GitHub Pages today; a Cloudflare Pages migration (abf-zdv.3.2) is deferred until 2026-10-11.

## Goals / Non-Goals

**Goals:**
- Verify, automatically, that the live deployed URL loads and core pages render after every deploy.
- Make the verification mechanism destination-agnostic: the same test files work against local, GitHub Pages, or a future Cloudflare target.
- Give each e2e test a clear, single-purpose meaning (what breaking it tells you) instead of today's conflated `smoke.spec.ts`.

**Non-Goals:**
- Scheduled/cron synthetic monitoring independent of deploys.
- Blocking or rolling back a bad deploy — GitHub Pages has no "gate before serving" hook; this is detect-after-the-fact.
- Wiring a Cloudflare-specific post-deploy step (the config supports it generically, but no workflow step is added until that migration ships).
- Fixing the flakiness behind the console-error check (`tests/e2e/reachability/console-errors.spec.ts` gets a home, not a fix).
- Correcting `openspec/specs/static-site-hosting/spec.md`'s stale claim that Cloudflare is already production (tracked as abf-k8c).

## Decisions

**1. `PLAYWRIGHT_BASE_URL` env var branch in `playwright.config.ts`, not a second config file.**
A single config with a conditional keeps the `webServer`/`baseURL` logic in one place and avoids two configs drifting (project list, reporter, trace settings, etc.) out of sync. Alternative considered: a separate `playwright.live.config.ts` — rejected because it would duplicate every non-target-specific setting and require remembering to update both when either changes.

**2. Tag-based selection (`@live-safe` / `@local-only`) via Playwright's `--grep`, not separate `testDir`s per tag.**
Directory placement (`reachability/`, `content/`, `ui/`) encodes *what* a test verifies; the tag encodes *where* it's safe to run — these are the two orthogonal axes from scoping. A test's directory and its live-safety are independent (e.g., a future `reachability/` test could still be `@local-only` if it depends on dev-mode-only behavior), so collapsing them into directory-based selection would conflate the axes back together. Playwright's built-in `--grep`/`tag` support needs no new tooling.

**3. Split `smoke.spec.ts` into three single-purpose files, not just re-tag it as one file.**
Today's file conflates four unrelated assertions (title, DOM structure, CSS class, console errors) in one `test()`, so a failure requires reading the test body to know what broke. Splitting by failure-meaning (reachability/title vs. layout/render vs. console-errors) makes CI failures self-describing from the test name alone, which matters more once this suite's output is a post-deploy health signal someone (i.e., the repo owner) has to interpret from a notification.

**4. Post-deploy step lives in `deploy.yml`, not a separate workflow.**
It needs `steps.deployment.outputs.page_url` from the `deploy-pages` action, which only exists within that job. A separate workflow would need to be triggered via `workflow_run` and re-derive or hardcode the URL, adding indirection for no benefit at this scale.

**5. New `test:e2e:live` npm script wraps `playwright test --grep @live-safe`, matching the existing `test:e2e` pattern.**
Keeps the `bun run <script>` convention (AGENTS.md) rather than inlining the `--grep` flag directly into the workflow YAML, so the same command is runnable and discoverable locally.

**6. `content/blog-links.spec.ts` is `@local-only`, not `@live-safe`.**
Its assertions (every internal `/blog/` link resolves) concern content baked in at build time, not the hosting/deploy layer — the same links exist regardless of which host serves them, and are already exercised pre-merge against the local build. Tagging it live-safe would add unbounded request volume against production (scaling with post count, on every push to `main`) without adding deploy-specific signal: a broken base path or routing config would already surface as a `reachability/` failure. Reserving `@live-safe` for reachability/layout keeps the live-verification traffic footprint fixed regardless of blog size.

**7. Tags use Playwright's native `{ tag: '@live-safe' }` option, pinned explicitly in tasks.md, not a title-string convention.**
This repo runs `@playwright/test@^1.62.0`, well past the v1.42 introduction of first-class tag support (`test('...', { tag: '@x' }, ...)` / `test.describe('...', { tag: '@x' }, ...)`, filterable via `--grep`/`--grep-invert` or the `grep`/`grepInvert` config option). Using the real option instead of embedding `@live-safe` as a substring in test titles avoids silent selection bugs (a rename dropping the marker, a describe-level tag not applying to nested tests) and gives IDE/tooling-visible metadata instead of a string convention.

**8. The post-deploy step uploads the Playwright report and trace as a workflow artifact on failure.**
Neither existing workflow currently uploads `playwright-report/` — the pre-merge job only needed pass/fail, since a failure is immediately reproducible locally. A live-verification failure is different: the person investigating (repo owner, from a GitHub notification) has no local repro of "what did the live page actually render" without this. `if: failure()` keeps the cost at zero on the (expected) common case of success.

No new dependencies are introduced — this reuses the existing Playwright installation, so no `bunfig.toml` `minimumReleaseAge` exception is needed.

## Risks / Trade-offs

- **[Risk]** GitHub Pages CDN propagation may lag behind the `deploy-pages` action's reported completion, causing the live-verification step to hit stale or not-yet-updated content and false-fail. → **Mitigation**: none built in initially; if this proves flaky in practice, add a short retry/backoff in the workflow step rather than in the test files themselves.
- **[Risk]** A live-verification failure has no automated remediation — the site can stay broken until the owner notices the red CI run. → **Mitigation**: accepted for a personal blog at this scale; explicitly a non-goal to build alerting/rollback beyond default GitHub Actions failure notifications.
- **[Trade-off]** Splitting one file into five adds file-count overhead for a small test suite. → Accepted: the clarity gain (self-describing failures, clean live-safe/local-only selection) outweighs the extra files at this scale.

## Adversarial review and mitigations

An independent subagent review (fresh context, given only the proposal/spec/design and the actual current files being changed) surfaced the following. Findings are recorded with resolution status.

- **[Checked, not an issue] `page_url` could be a GitHub Pages subpath (`https://mkobit.github.io/allbugsarefixed/`), breaking every root-relative `page.goto('/')` navigation.**
  Verified directly against `gh api repos/mkobit/allbugsarefixed/pages`: the custom domain `allbugsarefixed.com` is configured and its HTTPS certificate is approved, so `page_url` resolves to `https://allbugsarefixed.com/` (root). Root-relative navigation is safe. If the custom domain were ever removed, tests would then fail consistently — which is correct behavior (a real deploy-config break), not a false positive to guard against.

- **[Addressed via decision 6] `blog-links.spec.ts` as `@live-safe` is unbounded live traffic that scales with post count.**
  Resolved by keeping it `@local-only` — see Decision 6. Live-verification traffic is now fixed regardless of blog growth.

- **[Addressed via decision 8] No failure artifacts captured — a red run gives pass/fail with no way to see what actually rendered.**
  Resolved by uploading the Playwright report/trace `if: failure()` — see Decision 8.

- **[Addressed via decision 7] Tag mechanism was unspecified across files with inconsistent existing structure (`describe` vs bare `test()`), risking silent `--grep` selection bugs.**
  Resolved by pinning the native `{ tag: '@x' }` option explicitly — see Decision 7. `tasks.md` will call this out per-file so the convention isn't left to implementation-time interpretation.

- **[Accepted risk, not mitigated further] Retries (`process.env.CI ? 2 : 0`, inherited from the shared config) don't address CDN propagation lag, and repeated red runs on a personal repo risk being ignored ("cry wolf") before the cause (propagation vs. real break) is diagnosed.**
  With `blog-links` no longer live-safe, the live-verification surface is now small and fixed (reachability + console-errors), so retry-amplified traffic is no longer a scaling concern. The report/trace artifact (Decision 8) gives the diagnostic signal needed to tell propagation lag from a real break on the first failure. A dedicated backoff/retry tuned for propagation lag is deferred — per the proposal's non-goals, this is only worth building if it proves flaky in practice, not speculatively.

- **[Checked, not an issue] Internal consistency across proposal/spec/design (file names, tags, script names), and reorg blast radius (ESLint globs, AGENTS.md references, coverage config).**
  Verified: no other file in the repo references the old flat test paths (`smoke.spec.ts`, `blog_integrity.spec.ts`, `scroll_progress.spec.ts`) by name outside `tests/e2e/` itself, so the rename/move has no other knock-on edits.
