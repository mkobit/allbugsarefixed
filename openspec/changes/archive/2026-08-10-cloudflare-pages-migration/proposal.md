## Why

Migrating site hosting to Cloudflare Pages fulfills decision epic `abf-zdv.3` to modernize delivery and enable PR preview deployments.
Cloudflare Pages provides automated edge deployment and isolated preview environments driven via Git and CLI tooling.

## What Changes

- Add Wrangler configuration for Cloudflare Pages project settings.
- Add GitHub Actions workflows to deploy static build artifacts to Cloudflare Pages on `main` branch pushes.
- Add GitHub Actions workflow for pull request preview deployments.
- Document domain and DNS setup procedures for `allbugsarefixed.com`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `static-site-hosting`: specify GitHub Actions and Wrangler integration mechanisms for production and preview deployments.

## Impact

- GitHub Actions workflow files under `.github/workflows/`.
- Project configuration files for Cloudflare (`wrangler.json`).
- Repository secrets and environment configuration for Cloudflare API tokens.
