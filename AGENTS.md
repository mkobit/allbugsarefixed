# Project agent instructions

This repository contains a personal blog and research notes.

## CI Required Commands

You **MUST** run the following commands before submitting any changes. These commands mirror the steps in the Continuous Integration (CI) pipeline, and running them locally ensures that your PR will not fail CI.

**CI Workflow File:** [.github/workflows/check.yml](.github/workflows/check.yml) (see [reusable-check.yml](.github/workflows/reusable-check.yml) for the actual commands CI runs)

**Use `bun run <script>`, not bare `bun <script>`.** `test` and `build` are Bun's own reserved subcommands (Bun's built-in test runner and bundler, respectively) — the bare form silently does the wrong thing instead of running this project's npm script, even though most other script names (`lint`, `typecheck`, `coverage`, etc.) work fine either way.

1.  **Verify Versions:** `bun scripts/verify-versions.mjs`
    - Checks that node and bun versions match requirements.
2.  **Lint:** `bun run lint`
    - Runs ESLint on .js, .ts, .tsx, .astro, .mdx files.
3.  **Validate specs:** `bun run openspec:validate`
    - Validates OpenSpec changes and specs under `openspec/`.
4.  **Typecheck:** `bun run typecheck`
    - Runs `astro check` and `tsc` to verify types.
5.  **Unit Tests:** `bun run test`
    - Runs Vitest unit tests. (Bare `bun test` invokes Bun's own test runner instead, which will try and fail to run the Playwright specs under `tests/e2e/`.)
6.  **Coverage:** `bun run coverage`
    - Runs Vitest coverage analysis.
7.  **Build:** `bun run build`
    - Builds the Astro site for production. (Bare `bun build` errors with "Missing entrypoints" — it's Bun's bundler, not this script.)
8.  **E2E Tests:** `bun run test:e2e`
    - Runs Playwright end-to-end tests.

## Other Commands

- **Dev:** `bun start` (starts the dev server)
- **New idea:** `bun new-idea "My Title"` (use this to start a new research notebook or blog post)

## Issue tracking

This project uses `bd` (beads) for issue tracking.
Run `bd prime` for full workflow context before creating or updating issues.
Key commands: `bd ready` (unblocked work), `bd create "Title" --type task` (new issue), `bd close <id>` (complete).
Push local issue history to origin with `bd dolt push` after closing work.
When the implementation approach isn't decided yet, describe the problem/goal in the issue and leave the solution open for the design phase — don't bake in a specific technical approach until it's actually been verified or decided.

## Specs

This project uses OpenSpec for spec-driven development, with a project-local `beads-driven` schema at `openspec/schemas/beads-driven/`.
Artifact flow: proposal → specs → design → tasks → retrospective → reflection.
`design.md` must include an `## Adversarial review and mitigations` section before `tasks.md` is created or beads issues are staged.
After writing `tasks.md`, hydrate it into beads with `bd mol pour openspec-sync --var change_name=<name>`.
Use the `/opsx:propose`, `/opsx:apply`, `/opsx:archive` slash commands to work with specs.

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
- **Frontend guidance skill:**
  - The user-global `modern-web-guidance` skill covers current web-platform best practices.
  - Invoke it before HTML/CSS or client-side JS work in this repo, regardless of which agent tool is running.

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

## Jules agents

See `.jules/AGENTS.md`.
Check existing tooling and `.jules/` prompt files before adding a new automation script.

## Package Management

We have configured a `minimumReleaseAge` for package installs in `bunfig.toml` to mitigate supply chain risks.
If you encounter an error when installing a recently released package, be aware that it might be blocked by this configuration.
In such cases, **do not spin your wheels** trying to force the installation.
Instead:
- Use an older version of the package.
- Notify the user of the limitation.
