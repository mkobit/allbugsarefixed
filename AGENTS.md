# Project agent instructions

This repository contains a personal blog and research notes.

## CI Required Commands

You **MUST** run the following commands before submitting any changes. These commands mirror the steps in the Continuous Integration (CI) pipeline, and running them locally ensures that your PR will not fail CI.

**CI Workflow File:** [.github/workflows/check.yml](.github/workflows/check.yml)

1.  **Verify Versions:** `node scripts/verify-versions.mjs`
    - Checks that node and pnpm versions match requirements.
2.  **Lint:** `pnpm lint`
    - Runs ESLint on .js, .ts, .tsx, .astro, .mdx files.
3.  **Typecheck:** `pnpm typecheck`
    - Runs `astro check` and `tsc` to verify types.
4.  **Unit Tests:** `pnpm test`
    - Runs Vitest unit tests.
5.  **Coverage:** `pnpm coverage`
    - Runs Vitest coverage analysis.
6.  **Build:** `pnpm build`
    - Builds the Astro site for production.
7.  **E2E Tests:** `pnpm test:e2e`
    - Runs Playwright end-to-end tests.

## Other Commands

- **Dev:** `pnpm start` (starts the dev server)
- **New idea:** `pnpm new-idea "My Title"` (use this to start a new research notebook or blog post)

## General guidelines

- **Formatting:** ESLint is used for formatting (Prettier is NOT used).
- **Strictness:** Do not bypass checks. All tests and linting must pass.

## Architecture & Style

- **Astro as Glue, React for UI:**
  - Logic and styled components should reside in React (`.tsx`) files, typically in `src/components/ui`.
  - Astro (`.astro`) files should act as "glue" code: fetching data, handling routing, and rendering top-level React components.
  - Avoid heavy business logic or complex styling in `.astro` files.
- **Writing Style:**
  - Use **Sentence case** for headings and titles.
  - Use **semantic line breaks** (one sentence per line) in Markdown and MDX files to improve diff readability.

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
