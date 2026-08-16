# Project agent instructions

This repository contains a personal blog and research notes.

## CI Required Commands

You **MUST** run the following commands before submitting any changes. These commands mirror the steps in the Continuous Integration (CI) pipeline, and running them locally ensures that your PR will not fail CI.

**CI Workflow File:** [.github/workflows/check.yml](.github/workflows/check.yml) (see [reusable-check.yml](.github/workflows/reusable-check.yml) for the actual commands CI runs)

**Use `bun run <script>`, not bare `bun <script>`.** `test` and `build` are Bun's own reserved subcommands (Bun's built-in test runner and bundler, respectively) — the bare form bypasses this project's npm script and its arguments, even though most other script names (`lint`, `typecheck`, `coverage`, etc.) work fine either way.

1.  **Verify versions:** `bun scripts/verify-versions.ts`
2.  **Lint:** `bun run lint`
3.  **Validate specs:** `bun run openspec:validate`
4.  **Typecheck:** `bun run typecheck`
5.  **Unit tests:** `bun run test`
    - Bare `bun test` invokes Bun's test runner unscoped (repo-wide default file discovery) instead of the `src`-scoped run this script defines, so it will try and fail to run the Playwright specs under `tests/e2e/`.
6.  **Coverage:** `bun run coverage`
7.  **Build:** `bun run build`
    - Bare `bun build` errors with "Missing entrypoints" — it's Bun's bundler, not this script.
8.  **E2E tests:** `bun run test:e2e`

Alternatively, run `mise run check` to execute all 8 verification steps.


## Other Commands

- **Dev:** `bun start` (starts the dev server)
- **New idea:** `bun new-idea "My Title"` (creates the post folder and `index.mdx`)

## Issue tracking

This project uses `bd` (beads) for issue tracking.
Run `bd prime` for full workflow context before creating or updating issues.
Key commands: `bd ready` (unblocked work), `bd create "Title" --type task` (new issue), `bd close <id>` (complete).
Available formula templates in `.beads/formulas/`: `openspec-workflow`, `openspec-sync`, `blog-lifecycle`, `ci-fix`.
Push local issue history to origin with `bd dolt push` after closing work.
When the implementation approach isn't decided yet, describe the problem/goal in the issue and leave the solution open for the design phase — don't bake in a specific technical approach until it's actually been verified or decided.

## Specs

This project uses OpenSpec for spec-driven development, with a project-local `beads-driven` schema at `openspec/schemas/beads-driven/`.
**Always invoke OpenSpec via `bun x openspec` (or `bun run openspec:*`), never the bare `openspec` command.** The project pins `@fission-ai/openspec` in `package.json`'s devDependencies; a bare `openspec` resolves to whatever's on `$PATH` (e.g. a stale/unpinned global `mise` shim), which can silently run a different version.
Artifact flow: proposal → specs → design → tasks → retrospective → reflection.
The full change lifecycle can be tracked in beads via `bd mol pour openspec-workflow --var change_name=<name>`.
`design.md` must include an `## Adversarial review and mitigations` section before `tasks.md` is created or beads issues are staged.
Before writing `tasks.md`, explicitly re-read `proposal.md`'s component and file lists against `design.md`'s decisions and exclusions to reconcile scope divergences immediately.
After writing `tasks.md`, hydrate it into beads with `bd mol pour openspec-sync --var change_name=<name>`.
Because `bd` formulas do not interpolate `{{change_name}}` inside `labels` arrays (see `abf-2cq`), manually add `meta:openspec:<name>` to the 'Expand Tasks' bead and all created child task beads.
When an OpenSpec-tracked epic closes in beads, reconcile `tasks.md` checkboxes against actual bead/PR status and archive the change via `bun x openspec archive <name>` (or `/opsx:archive`) so completed changes do not linger unarchived.
Use the `/opsx:propose`, `/opsx:apply`, `/opsx:archive` slash commands to work with specs.

## General guidelines

- **Formatting:** ESLint is used for formatting (Prettier is NOT used).
- **Strictness:** Do not bypass checks. All tests and linting must pass.

## Architecture & Style

- **Astro as Glue, React for UI:**
  - Logic and styled components should reside in React (`.tsx`) files, typically in `src/components/ui`.
  - Astro (`.astro`) files should act as "glue" code: fetching data, handling routing, and rendering top-level React components.
  - Avoid heavy business logic or complex styling in `.astro` files.
  - Any task adding or modifying a hydrated React island (`client:load`, `client:visible`, `client:idle`) requires runtime hydration verification in a real browser, not just typecheck/lint.
- **Writing Style:**
  - Use **Sentence case** for headings and titles.
  - Use **semantic line breaks** (one sentence per line) in Markdown and MDX files to improve diff readability.
- **Frontend guidance skill:**
  - The user-global `modern-web-guidance` skill covers current web-platform best practices.
  - Invoke it before HTML/CSS or client-side JS work in this repo, regardless of which agent tool is running.

## Blog & research

For instructions on how to handle blog posts, drafts, and research notes, strictly follow the guidelines in:
**`src/content/blog/AGENTS.md`**

## File structure

- `src/content/blog/`: Contains all blog posts and research (one `index.mdx` per post — see `src/content/blog/AGENTS.md`).
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
