## Context

The blog is currently deployed to GitHub Pages via `.github/workflows/deploy.yml` using `actions/deploy-pages`.
Evaluating alternative static hosting platforms (Cloudflare Pages vs AWS CloudFront + S3 vs GitHub Pages) is needed to support PR preview deployments, faster global edge distribution, custom HTTP headers, and edge redirects.

## Goals / Non-Goals

**Goals:**
- Select Cloudflare Pages as the target hosting platform for `allbugsarefixed.com`.
- Document comparative analysis of GitHub Pages, Cloudflare Pages, and CloudFront + S3.
- File follow-up implementation epics for Cloudflare Pages deployment migration and PR preview deployments.

**Non-Goals:**
- Implementing the Cloudflare Pages workflow or DNS cutover in this decision change.
- Migrating the site output from static HTML (`output: 'static'`) to server-side rendering.

## Decisions

### Decision 1: Select Cloudflare Pages over GitHub Pages and AWS CloudFront + S3

- **GitHub Pages**: Free and integrated with GitHub, but lacks native PR preview environments, custom header control, and edge worker extensibility.
- **AWS CloudFront + S3**: Enterprise-grade flexibility, but adds AWS IAM/ACM/S3 management overhead, Route 53 costs, and manual invalidation scripting in CI.
- **Cloudflare Pages**: Free tier includes unlimited bandwidth, zero-config custom domain TLS, instant global CDN caching, native PR preview URLs per pull request, and seamless integration via Wrangler or GitHub Actions.

## Risks / Trade-offs

- [Risk] Cloudflare Pages deployment requires managing a Cloudflare API token or GitHub integration credentials. → Mitigation: store Cloudflare API tokens securely in GitHub Repository Secrets.
- [Risk] Custom domain DNS cutover may cause temporary propagation delays if TTL is high. → Mitigation: lower TTL on DNS records prior to cutover during migration phase.

## Adversarial review and mitigations

- **Objection 1**: GitHub Pages is already working and zero-maintenance, so why switch?
  - **Mitigation**: GitHub Pages lacks native PR preview deployments (`abf-zdv.3.1`), which requires custom preview infrastructure; Cloudflare Pages handles PR previews out of the box with zero additional infrastructure.
- **Objection 2**: Cloudflare API token exposure or quota limits in CI.
  - **Mitigation**: Cloudflare Pages free tier includes 500 builds per month and unlimited static bandwidth; deployment credentials use scoped API tokens limited to Pages write access.

## Migration Plan

1. Record decision in this OpenSpec change and close decision epic `abf-zdv.3`.
2. File follow-up implementation epic `abf-zdv.3.2` for Cloudflare Pages deployment workflow setup and DNS migration.
3. Unblock `abf-zdv.3.1` (PR preview deployments) to build on top of Cloudflare Pages.

## Open Questions

None.
