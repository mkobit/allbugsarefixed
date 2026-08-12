# live-deploy-verification Specification

## Purpose
TBD - created by archiving change live-deploy-verification. Update Purpose after archive.
## Requirements
### Requirement: Post-deploy live verification
After a deploy to a hosting target completes, the pipeline SHALL run automated checks against the actual deployed URL confirming core pages load and render, independent of any check performed against a local build.

#### Scenario: Successful deploy passes live verification
- **WHEN** `deploy.yml` finishes deploying to GitHub Pages and the deployment URL is known
- **THEN** a CI step runs the `@live-safe` tagged e2e tests against that URL and the workflow succeeds if all of them pass

#### Scenario: Broken live deploy fails the workflow
- **WHEN** the deployed site returns an error, fails to load, or fails a reachability/content check
- **THEN** the post-deploy verification step fails, marking the workflow run red

### Requirement: Destination-agnostic test configuration
The e2e test suite SHALL be runnable against any base URL (local preview, GitHub Pages, or a future hosting target) without modifying test spec files.

#### Scenario: Running against a local build
- **WHEN** no external base URL is provided
- **THEN** Playwright starts a local preview server and runs tests against it, as today

#### Scenario: Running against a deployed URL
- **WHEN** an external base URL is provided via `PLAYWRIGHT_BASE_URL`
- **THEN** Playwright runs the same spec files against that URL without starting a local preview server

### Requirement: Test categorization by live-safety
Each e2e test SHALL be tagged, using Playwright's native `tag` option, to indicate whether it is safe and meaningful to run against a live deployed target, so a subset can be selected independent of the full suite. A test is tagged `@live-safe` only if its assertions concern the deploy/hosting layer itself (the page is reachable, core markup and styling render); tests whose concern is content correctness baked in at build time (e.g. internal link validity) are `@local-only`, since that content doesn't change based on deploy target and is already verified pre-merge.

#### Scenario: Selecting live-safe tests only
- **WHEN** the post-deploy verification step runs
- **THEN** only tests tagged `@live-safe` execute, excluding `@local-only` tests

#### Scenario: Full suite still runs pre-merge
- **WHEN** the pre-merge CI gate (`reusable-check.yml`) runs `bun run test:e2e`
- **THEN** all tests run regardless of tag, against the local build, as today

### Requirement: Diagnosable live-verification failures
When the post-deploy verification step fails, the workflow SHALL retain the Playwright report and trace as a downloadable artifact so the failure can be diagnosed without manually reproducing it against the live URL.

#### Scenario: Live verification fails
- **WHEN** any `@live-safe` test fails during the post-deploy step
- **THEN** the workflow uploads the Playwright HTML report and trace as a build artifact before completing

