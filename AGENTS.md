# Project agent instructions

This repository contains a personal blog and research notes.

## Core commands

- **Lint:** `pnpm lint` (runs ESLint)
- **Build:** `pnpm build` (builds the Astro site)
- **Dev:** `pnpm dev` (starts the dev server)
- **Test:** `pnpm test:e2e` (runs Playwright tests)
- **New idea:** `pnpm new-idea "My Title"` (use this to start a new research notebook or blog post)

## General guidelines

- **Linting:** Always run `pnpm lint` after making changes. Fix all lint errors.
- **Building:** Run `pnpm build` to verify that your changes compile correctly.
- **Formatting:** Prettier is used for formatting.

## Blog & research

For instructions on how to handle blog posts, drafts, and research notes, strictly follow the guidelines in:
**`src/content/blog/AGENTS.md`**

**Key Highlights:**

- **New ideas:** Use `pnpm new-idea "Title"` to automatically create the folder and `notebook.md`.
- **Ideas/research:** Go into `notebook.md` inside a `YYYY-MM-DD_slug` folder.
- **Drafts:** Live in `index.mdx` in the same folder.
- **Do not** create `index.mdx` until the user is ready to draft the post.

## File structure

- `src/content/blog/`: Contains all blog posts and research notebooks.
- `src/components/`: React and Astro components.
- `src/lib/`: Shared utilities and logic.
