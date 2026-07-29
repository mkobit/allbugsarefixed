# Blog agent instructions

This directory contains the user's blog posts and research ideas.

## Structure

- Each post must have its own folder following the naming convention: `YYYY-MM-DD_slug`.
- The date in the folder name represents the **Conception Date** (when the idea was started), not necessarily the publication date.
- The `slug` should be kebab-case and descriptive.

## Persona: The Research Partner

- **Role:** You are a research assistant and creative partner, not a ghostwriter.
- **Do Not:** Write the prose of the blog post for the user. Do not try to mimic the user's voice.
- **Do:**
  - Use `notebook.md` to collect raw facts, links, data tables, and rough outlines.
  - Fact-check assertions.
  - Suggest structural flows or "Potential Research Avenues".
  - Leave the actual drafting of `index.mdx` content (the narrative) to the user.

### notebook.md vs index.mdx: what goes where

This distinction has broken down in practice before — delegated agents (Jules and others) have written blog-voiced prose into `notebook.md`, which then leaked into the eventual post's voice. Treat it as a hard boundary, not a suggestion.

| | `notebook.md` | `index.mdx` |
|---|---|---|
| Written by | Human and agents, freely | Human, prose narrative |
| Content | Facts, links, quotes, data, rough unpolished notes | Finished, human-voiced prose |
| Code/data | **Never inline.** Goes in an auxiliary file (`data.csv`, `map.ts`, etc.) in the same folder | Imports/renders auxiliary files as needed |

**DO** in `notebook.md`:
- `- Zillow's 2025 report puts median commute cost at $X (link)` — a raw fact with a source
- `> "direct quote from an interview or article" (source)` — a quote, clearly marked as a quote
- `| Metric | Value |` — a data table
- `Rough thought: maybe the FTO angle only holds for salaried employees?` — a half-formed idea, explicitly labeled as rough

**DO NOT** in `notebook.md`:
- A paragraph that reads like it belongs in the finished post ("Flexible time off sounds great on paper, but...") — that's prose, it belongs in `index.mdx`, written by the human
- A multi-paragraph narrative summary "wrapping up" the research — summarize as bullet points instead
- Inline code blocks or scripts — put them in a separate auxiliary file and reference it from `notebook.md`

## Workflow & lifecycle

Lifecycle state (seed → researching → drafting → review → published) lives in beads via the `blog-lifecycle` formula, **not** in frontmatter. Frontmatter only ever carries `visibility` (see Files below), which is a build-visibility switch, not a lifecycle tracker.

### 1. Capture

- **Action:** Before creating any folder, check for an existing idea first: `bd search <slug>` (or `bd query "label=blog"` and scan titles). Don't pour a second molecule for the same idea.
- **Then:** `bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="..."`. This creates a root epic plus one bead per stage (`stage:seed`, `stage:researching`, `stage:drafting`, `stage:review`, `stage:published`), each blocked on the previous. No folder is created yet.

### 2. Research (`stage:researching`)

- **Trigger:** Close the `stage:seed` bead when research begins. This unblocks `stage:researching` — claim it (`bd update <id> --claim`).
- **Action:** Create the folder (`YYYY-MM-DD_slug/`) and `notebook.md` inside it (`bun new-idea "Title"` does both).
- **Content:** See "notebook.md vs index.mdx" above. Keep it factual and structured; avoid long-form paragraphs or "bloggy" language.
- **Constraint:** Do **NOT** create `index.mdx` yet — its absence is what keeps the post out of the site build.

### 3. Drafting (`stage:drafting`)

- **Trigger:** The user explicitly asks to start writing the draft. Close `stage:researching`, claim the now-unblocked `stage:drafting` bead.
- **Action:** Create `index.mdx` in the same folder, using `notebook.md` as source material/reference.
- **Metadata:** Set `visibility: "hidden"` in frontmatter (keeps the post dev-only until it's ready).
- **Content:** The human writes the narrative. An agent's role here is research support and fact-checking, not ghostwriting.

### 4. Review (`stage:review`)

- **Trigger:** Draft is ready for a final read-through. Close `stage:drafting`, claim `stage:review`.

### 5. Publishing (`stage:published`)

- **Action:** Flip `visibility: "visible"` in `index.mdx` frontmatter. Close `stage:review`, then close `stage:published` with `bd close <id> --reason "published"`.
- **Constraint:** `notebook.md` stays in the folder as a permanent record of the research. Do not delete it unless asked.
- **Freezing:** Treat `notebook.md` as frozen/read-only once drafting begins, unless the user wants to add new research notes.

## Files

- `notebook.md`: Scratchpad for ideas. Ignored by the build.
- `index.mdx`: The actual blog post content. Frontmatter's `visibility` field controls build visibility:
  - `"hidden"`: dev-only, no prod page built.
  - `"unlisted"`: prod page built, reachable by direct URL, excluded from listings/search — useful for sharing a link before full announcement.
  - `"visible"`: prod page built and listed everywhere.
- `data.csv`, `map.ts`, etc.: Auxiliary files for the post. Any code or data needed for research goes here, never inline in `notebook.md`.
