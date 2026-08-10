## Why

Evaluate static site hosting providers to decide between staying on GitHub Pages or migrating to Cloudflare Pages (or AWS CloudFront + S3).
Evaluating hosting now ensures infrastructure support for upcoming features like automated PR preview deployments, custom headers, edge redirects, and fast global CDN performance.

## What Changes

- Evaluate GitHub Pages, Cloudflare Pages, and AWS CloudFront + S3 across cost, custom domain handling, build/deploy complexity, edge features, and PR preview capabilities.
- Record decision to migrate from GitHub Pages to Cloudflare Pages for hosting `allbugsarefixed.com`.
- File a follow-up implementation epic for setting up Cloudflare Pages deployment and PR preview workflows.

## Capabilities

### New Capabilities
- `static-site-hosting`: hosting infrastructure decision and capabilities for serving static blog assets and PR preview deployments.

### Modified Capabilities

## Impact

- `.github/workflows/deploy.yml`: deployment workflow to be updated for Cloudflare Pages integration.
- `astro.config.mjs`: site URL and static build output configuration.
