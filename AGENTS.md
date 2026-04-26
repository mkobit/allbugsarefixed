# Project agent instructions

This repository contains a personal blog and research notes.

## CI Required Commands

You **MUST** run the following commands before submitting any changes. These commands mirror the steps in the Continuous Integration (CI) pipeline, and running them locally ensures that your PR will not fail CI.

**CI Workflow File:** [.github/workflows/check.yml](.github/workflows/check.yml)

1.  **Verify Versions:** `node scripts/verify-versions.mjs`
    - Checks that node and bun versions match requirements.
2.  **Lint:** `bun lint`
    - Runs ESLint on .js, .ts, .tsx, .astro, .mdx files.
3.  **Typecheck:** `bun typecheck`
    - Runs `astro check` and `tsc` to verify types.
4.  **Unit Tests:** `bun test`
    - Runs Vitest unit tests.
5.  **Coverage:** `bun coverage`
    - Runs Vitest coverage analysis.
6.  **Build:** `bun build`
    - Builds the Astro site for production.
7.  **E2E Tests:** `bun test:e2e`
    - Runs Playwright end-to-end tests.

## Other Commands

- **Dev:** `bun start` (starts the dev server)
- **New idea:** `bun new-idea "My Title"` (use this to start a new research notebook or blog post)

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

- **New ideas:** Use `bun new-idea "Title"` to automatically create the folder and `notebook.md`.
- **Ideas/research:** Go into `notebook.md` inside a `YYYY-MM-DD_slug` folder.
- **Drafts:** Live in `index.mdx` in the same folder.
- **Do not** create `index.mdx` until the user is ready to draft the post.

## File structure

- `src/content/blog/`: Contains all blog posts and research notebooks.
- `src/components/`: React and Astro components.
- `src/lib/`: Shared utilities and logic.

## Package Management

We have configured a `minimumReleaseAge` for package installs in `bunfig.toml` to mitigate supply chain risks.
If you encounter an error when installing a recently released package, be aware that it might be blocked by this configuration.
In such cases, **do not spin your wheels** trying to force the installation.
Instead:
- Use an older version of the package.
- Notify the user of the limitation.

## UI Development & "Eyes" Workflow

Jules has a utility script (`scripts/capture-ui.ts`) to provide visual feedback and a structural layout summary of UI components. This gives Jules "eyes" into how changes actually look and render in the browser.

When working on UI components, layouts, or CSS changes, follow these rules:
1. **Always verify visual changes:** Whenever you create or modify a UI component or layout, you **MUST** run the capture script to verify your work.
   - Command: `bun run scripts/capture-ui.ts --url <page-url> [--selector <css-selector>] [--device desktop|mobile|both]`
   - Example: `bun run scripts/capture-ui.ts --url /test-callout/ --selector "#my-component"`
2. **Present the screenshots:** Use the markdown image syntax output by the script to present the generated screenshots in the chat thread so the user can easily review the visual changes.
3. **Analyze the layout snapshot:** Use the text-based layout snapshot (bounding boxes, alignment, text content) printed to the console to programmatically verify structural alignment, spacing, and hierarchy, allowing you to self-correct CSS/styling issues autonomously.
4. **Transient artifacts:** The generated screenshots are transient and saved in the `.gitignore`d `screenshots/` directory. **NEVER** commit these screenshots to version control.
