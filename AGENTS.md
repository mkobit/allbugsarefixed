# Project Agent Instructions

This repository contains a personal blog and research notes.

## Core Commands
- **Lint:** `pnpm lint` (runs ESLint)
- **Build:** `pnpm build` (builds the Astro site)
- **Dev:** `pnpm dev` (starts the dev server)
- **Test:** `pnpm test:e2e` (runs Playwright tests)

## General Guidelines
- **Linting:** Always run `pnpm lint` after making changes. Fix all lint errors.
- **Building:** Run `pnpm build` to verify that your changes compile correctly.
- **Formatting:** Prettier is used for formatting.

## Blog & Research
For instructions on how to handle blog posts, drafts, and research notes, strictly follow the guidelines in:
**`src/content/blog/AGENTS.md`**

**Key Highlights:**
- **Ideas/Research:** Go into `notebook.md` inside a `YYYY-MM-DD_slug` folder.
- **Drafts:** Live in `index.mdx` in the same folder.
- **Do not** create `index.mdx` until the user is ready to draft the post.

## File Structure
- `src/content/blog/`: Contains all blog posts and research notebooks.
- `src/components/`: React and Astro components.
- `src/lib/`: Shared utilities and logic.
