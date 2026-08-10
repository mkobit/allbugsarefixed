## 1. Cloudflare Pages Configuration

- [x] 1.1 Create `wrangler.json` project configuration file at repository root.
- [x] 1.2 Add `wrangler` devDependency to `package.json` for reproducible CLI deployments.

## 2. GitHub Actions Deployment Workflows

- [x] 2.1 Create `.github/workflows/deploy-pages.yml` workflow for production deployments on `main`.
- [x] 2.2 Add PR preview deployment job and GitHub status integration in `.github/workflows/deploy-pages.yml`.

## 3. Documentation & Credentials Guidance

- [x] 3.1 Document Cloudflare API token generation, repository secret setup, and Cloudflare Pages project creation.
- [x] 3.2 Document custom domain DNS configuration for `allbugsarefixed.com`.

## 4. Verification

- [x] 4.1 Execute `mise run check` to verify all 8 CI checks pass.
