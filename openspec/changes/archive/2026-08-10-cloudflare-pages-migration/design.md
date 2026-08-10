## Context

The site currently builds to `dist/` using Astro and Bun.
Migrating from GitHub Pages to Cloudflare Pages requires configuring continuous deployment via GitHub Actions, defining repository configuration in code, and pointing domain DNS records to Cloudflare.

## Goals / Non-Goals

**Goals:**

- Define Cloudflare Pages project configuration in code using `wrangler.json`.
- Implement GitHub Actions workflow for automated production deployments on `main` branch pushes.
- Implement GitHub Actions workflow for PR preview deployments on pull requests.
- Provide step-by-step guidance for one-time Cloudflare API token setup and custom domain DNS configuration.

**Non-Goals:**

- Relying on Cloudflare dashboard Git integration for builds (builds remain in GitHub Actions to preserve Bun toolchain and CI checks).
- Configuring serverless Workers functions or dynamic SSR features in this change.

## Decisions

### Decision 1: GitHub Actions + Wrangler direct deployment over Cloudflare dashboard Git integration

- **Choice**: Use GitHub Actions to build the site with `bun run build` and deploy the output directory (`dist`) to Cloudflare Pages using `wrangler pages deploy`.
- **Rationale**: Keeps build environment, Bun versioning, and CI checks identical across local dev, PR checks, and production. Avoids dark UI configurations in Cloudflare dashboard settings.
- **Alternatives Considered**:
  - Cloudflare Git integration UI: requires configuring build commands in Cloudflare dashboard UI and relying on Cloudflare build image capabilities.

### Decision 2: Code-driven configuration with `wrangler.json`

- **Choice**: Track `wrangler.json` at repository root defining `name`, `pages_build_output_dir`, and `compatibility_date`.
- **Rationale**: Version-controls deployment parameters alongside site code.
- **Alternatives Considered**:
  - Uncommitted CLI flags in CI scripts: prone to drift between workflows.

### Decision 3: Cloudflare setup guidance

- **Choice**: Document initial one-time bootstrap commands and UI actions needed:
  1. Create Cloudflare Pages project: `npx wrangler pages project create allbugsarefixed --production-branch main`.
  2. Create Cloudflare API token with `Cloudflare Pages: Edit` permissions.
  3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to GitHub Repository Secrets.
  4. Add custom domain `allbugsarefixed.com` in Cloudflare Pages custom domains and update DNS CNAME.
- **Rationale**: Minimizes required UI interactions to initial credential creation while driving ongoing deployments entirely through Git code changes.

## Risks / Trade-offs

- [Risk: Invalid or expired API token in GitHub Actions] → Mitigation: Use a dedicated Cloudflare API Token scoped strictly to Cloudflare Pages Edit, and document token renewal steps.
- [Risk: Simultaneous PR preview deployment collisions] → Mitigation: Pass unique branch names (`--branch=${{ github.head_ref }}`) to Wrangler during preview deployment.

## Adversarial review and mitigations

- **Objection 1**: Why build in GitHub Actions instead of Cloudflare Pages auto-build?
  - **Mitigation**: GitHub Actions ensures `bun run check` (all 8 verification steps) executes before deployment artifacts are generated and pushed to Cloudflare Pages.
- **Objection 2**: Cloudflare Pages project auto-creation might fail if account ID is missing or incorrect.
  - **Mitigation**: Pre-create project via Wrangler CLI `npx wrangler pages project create` during setup phase.
- **Objection 3**: PR previews could accumulate stale deployments on Cloudflare Pages.
  - **Mitigation**: Cloudflare Pages automatically manages preview build retention and garbage collection per project limits.

## Migration Plan

1. Commit `wrangler.json` and deployment workflows (`.github/workflows/deploy-pages.yml`).
2. Run initial Wrangler setup command to create Cloudflare Pages project.
3. Save `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub repository secrets.
4. Merge deployment workflow to `main` and verify production deployment.
5. Point domain `allbugsarefixed.com` to Cloudflare Pages CNAME.

## Open Questions

- None.
