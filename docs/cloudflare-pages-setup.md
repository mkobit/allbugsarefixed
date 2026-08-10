# Cloudflare Pages Setup Guide

This guide details the steps to set up Cloudflare Pages for `allbugsarefixed.com` with GitHub Actions deployment and custom domain DNS configuration.

## Initial Cloudflare Pages project creation

Run Wrangler CLI locally to create the initial Cloudflare Pages project:

```bash
bunx wrangler pages project create allbugsarefixed --production-branch main
```

## Cloudflare API credentials configuration

1. Log into the Cloudflare Dashboard and navigate to My Profile -> API Tokens.
2. Click Create Token and select the Cloudflare Pages template (or create a custom token with `Cloudflare Pages: Edit` permissions).
3. Copy the generated API Token and your Cloudflare Account ID (visible in the Cloudflare dashboard sidebar or under Pages project settings).
4. In GitHub, navigate to Repository Settings -> Secrets and variables -> Actions.
5. Add repository secret `CLOUDFLARE_API_TOKEN` with your API token value.
6. Add repository secret `CLOUDFLARE_ACCOUNT_ID` with your Account ID value.

## Custom domain DNS configuration

1. In Cloudflare Dashboard, navigate to Workers & Pages -> allbugsarefixed -> Custom domains.
2. Click Set up a custom domain and enter `allbugsarefixed.com`.
3. If DNS for `allbugsarefixed.com` is managed by Cloudflare DNS, approve the automatic DNS CNAME record creation.
4. If DNS is hosted externally (e.g. AWS Route 53 or Namecheap), add a CNAME record pointing `allbugsarefixed.com` to `allbugsarefixed.pages.dev`.

## Continuous deployment workflow

- Pushes to `main` automatically build site artifacts and deploy to Cloudflare Pages production.
- Pull requests automatically build and deploy isolated preview environments accessible via preview URLs on Cloudflare Pages.
