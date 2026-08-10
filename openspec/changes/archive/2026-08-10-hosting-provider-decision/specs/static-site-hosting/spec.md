## ADDED Requirements

### Requirement: Cloudflare Pages production deployment
The production site SHALL be hosted on Cloudflare Pages for serving static assets of `allbugsarefixed.com`.

#### Scenario: Production build deployment
- **WHEN** changes land on `main` branch
- **THEN** Cloudflare Pages deploys the static build artifacts to production and updates global edge routing.

### Requirement: Cloudflare Pages PR preview deployments
Cloudflare Pages SHALL generate isolated preview deployments and unique preview URLs for active pull requests.

#### Scenario: Pull request preview build
- **WHEN** a pull request is opened or updated
- **THEN** Cloudflare Pages builds the change and provides a distinct preview URL for validation.
