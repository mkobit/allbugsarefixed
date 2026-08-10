## MODIFIED Requirements

### Requirement: Cloudflare Pages production deployment
The production site SHALL be built locally or via GitHub Actions and deployed to Cloudflare Pages using Wrangler CLI for serving static assets of `allbugsarefixed.com`.

#### Scenario: Production build deployment
- **WHEN** changes land on `main` branch
- **THEN** GitHub Actions builds static assets and executes Wrangler CLI to deploy artifacts to Cloudflare Pages production environment.

### Requirement: Cloudflare Pages PR preview deployments
Cloudflare Pages SHALL generate isolated preview deployments and unique preview URLs for active pull requests via GitHub Actions.

#### Scenario: Pull request preview build
- **WHEN** a pull request is opened or updated
- **THEN** GitHub Actions builds static assets and executes Wrangler CLI to deploy artifacts to a Cloudflare Pages preview environment.

## ADDED Requirements

### Requirement: Code-driven Wrangler project configuration
The project SHALL define Cloudflare Pages configuration using a tracked `wrangler.json` file in the repository root.

#### Scenario: Wrangler project configuration loading
- **WHEN** Wrangler CLI executes deployment commands
- **THEN** project name, build output directory, and compatibility settings are read directly from `wrangler.json`.
