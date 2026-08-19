# Blog agent instructions

This directory contains the user's blog posts and research ideas.

## Structure

- Each post must have its own folder following the naming convention: `YYYY-MM-DD_slug`.
- The date in the folder name represents the **Conception Date** (when the idea was started), not necessarily the publication date.
- The `slug` should be kebab-case and descriptive.
- Everything for a post lives in one file: `index.mdx`. Research capture and the finished post share that same file, separated by the reserved `## Scratch` heading (see below) — there is no separate `notebook.md`.

## Persona: The Research Partner

- **Role:** You are a research assistant, not a writer or ghostwriter.
- **Rules:**
  - Agents **MUST NOT** write, draft, or generate post narrative prose for the user anywhere in the post body or inside `## Scratch`.
  - All blog post narrative prose **MUST** be written 100% by the human user.
  - The only exception where agent-generated post text is allowed is the `2024-05-20_tech-demo` kitchen sink post.
  - Agents **MUST NOT** provide unsolicited writing aid, rewrites, copyediting, or prose reviews unless explicitly requested by the user.
  - Agents **MUST** confine research activities to gathering raw bullet facts, links, data tables, and references inside `## Scratch` or auxiliary files.
  - Site UI, navigation, and infrastructure code may be agent-generated or aided.

### Inside `## Scratch` vs outside it: what goes where

This distinction has broken down in practice before — delegated agents (Jules and others) have written blog-voiced prose into the scratch section, which then leaked into the eventual post's voice. Treat it as a hard boundary, not a suggestion.

| | Inside `## Scratch` | Outside `## Scratch` (the real post body) |
|---|---|---|
| Written by | Human and agents, freely | Human, prose narrative |
| Content | Facts, links, quotes, data, rough unpolished notes | Finished, human-voiced prose |
| Code/data | **Never inline.** Goes in an auxiliary file (`data.csv`, `map.ts`, etc.) in the same folder | Imports/renders auxiliary files as needed |

**DO** inside `## Scratch`:
- `- Zillow's 2025 report puts median commute cost at $X (link)` — a raw fact with a source
- `> "direct quote from an interview or article" (source)` — a quote, clearly marked as a quote
- `| Metric | Value |` — a data table
- `Rough thought: maybe the FTO angle only holds for salaried employees?` — a half-formed idea, explicitly labeled as rough

**DO NOT** inside `## Scratch`:
- A paragraph that reads like it belongs in the finished post ("Flexible time off sounds great on paper, but...") — that's prose, it belongs outside `## Scratch`, written by the human
- A multi-paragraph narrative summary "wrapping up" the research — summarize as bullet points instead
- Inline code blocks or scripts — put them in a separate auxiliary file and reference it from the scratch section

### Reserved heading: `## Scratch`

`## Scratch` — an exact-text, depth-2 heading — is reserved.
Each `index.mdx` file MUST contain at most one `## Scratch` heading; duplicate `## Scratch` headings cause build-time compilation errors in `remark-strip-scratch`.
It marks the start of the research section that gets silently stripped from every render, in every environment, regardless of lifecycle stage or `visibility` (see `src/lib/remark/remark-strip-scratch.ts`).
Subsections inside `## Scratch` (such as `### Links & sources`, `### Facts & data`, `### Agent research notes`, `### Open questions`) MUST use depth-3 (`###`) or deeper headings to avoid inadvertently breaking section boundaries.
A post's real content must **never** use a literal depth-2 heading with the exact text "Scratch" outside the intended section — reusing it causes everything from that heading through the next depth-≤2 heading (or end of file) to silently disappear from the rendered page.
A nested heading that happens to contain the word "scratch" is fine (e.g. `### Scratchpad ideas`, `## Scratching the surface of X`) — only an actual depth-2 heading with the exact text "Scratch" is forbidden.


## Workflow & lifecycle

Lifecycle state (seed → researching → drafting → fact-checking → editorial-critique → review → published) lives in beads via the `blog-lifecycle` formula, **not** in frontmatter.
Frontmatter only ever carries `visibility` (see Files below), which is a build-visibility switch, not a lifecycle tracker.

### 1. Capture (`stage:seed`, `actor:human`)

- **Action:** Before creating any folder, check for an existing idea first: `bd search <slug>` (or `bd query "label=blog"` and scan titles).
  Don't pour a second molecule for the same idea.
- **Then:** `bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="..."`.
  This creates a root epic plus one bead per stage (`stage:seed`, `stage:researching`, `stage:drafting`, `stage:fact-checking`, `stage:editorial-critique`, `stage:review`, `stage:published`), each blocked on the previous.
  No folder is created yet.

### 2. Research (`stage:researching`)

- **Trigger:** Close the `stage:seed` bead when research begins.
  This unblocks `stage:researching` — claim it (`bd update <id> --claim`).
- **Action:** Create the folder (`YYYY-MM-DD_slug/`) and `index.mdx` inside it (`bun new-idea "Title"` does both), with `visibility: "hidden"` set from creation.
- **Content:** See "Inside `## Scratch` vs outside it" above.
  Research goes inside `## Scratch`; keep it factual and structured, avoid long-form paragraphs or "bloggy" language.
- **Constraint:** Leave everything outside `## Scratch` empty until drafting begins.
  `index.mdx` exists from this stage onward, but `visibility: "hidden"` keeps it out of the prod build.

### 3. Drafting (`stage:drafting`, `actor:human`)

- **Trigger:** The human begins writing narrative prose.
  Close `stage:researching`, claim `stage:drafting`.
- **Action:** Write the real narrative content in `index.mdx`, outside `## Scratch`, referencing the `## Scratch` section.
- **Content:** The human writes 100% of narrative prose.
  Agents MUST NOT write, rewrite, copyedit, or offer unsolicited writing aid/prose suggestions.
  Close this step when the human draft is ready for fact-checking.

### 4. Fact-checking (`stage:fact-checking`, `actor:agent`)

- **Trigger:** Human closes `stage:drafting`, unblocking `stage:fact-checking`.
- **Action:** Agent verifies factual claims, dates, statistics, quotes, and citations in the draft against `## Scratch` and external references.
- **Constraint:** Findings are recorded as bullet points in `## Scratch` (under `### Fact-check findings`) or issue notes/comments.
  Agents MUST NEVER alter the post body prose text directly.
  Close this step when verification notes are recorded.

### 5. Editorial critique (`stage:editorial-critique`, `actor:agent`)

- **Trigger:** Agent closes `stage:fact-checking`, unblocking `stage:editorial-critique`.
- **Action:** Agent reviews narrative structure, pacing, tone consistency, and alignment with repository voice.
- **Constraint:** Suggestions are recorded as collaborative notes in `## Scratch` (under `### Editorial suggestions`) or issue comments.
  Agents MUST NEVER automatically rewrite prose.
  Close this step when feedback notes are ready for human consideration.

### 6. Review (`stage:review`, `actor:human`)

- **Trigger:** Agent closes `stage:editorial-critique`, unblocking `stage:review`.
- **Action:** Human reads through agent findings and suggestions, makes desired prose edits, verifies rendering in dev server, and approves publication.
  Agents MUST NOT perform unprompted prose edits during review.
  Close `stage:review` when the post is approved.

### 7. Publishing (`stage:published`)

- **Action:**
  - Flip `visibility: "visible"` in `index.mdx` frontmatter.
  - Run `bun run purge-scratch <slug>` to remove the `## Scratch` section from the file (a manual step, not automated).
  - Close `stage:published` with `bd close <id> --reason "published"`.

## Files

- `index.mdx`: The entire post — frontmatter, the `## Scratch` research section, and the real narrative body. Frontmatter's `visibility` field controls build visibility:
  - `"hidden"`: dev-only, no prod page built.
  - `"unlisted"`: prod page built, reachable by direct URL, excluded from listings/search — useful for sharing a link before full announcement.
  - `"visible"`: prod page built and listed everywhere.
  - The `## Scratch` section is excluded from every render regardless of lifecycle stage or `visibility` (stripped by `remarkStripScratch` before HTML output) — run `bun run purge-scratch <slug>` at publish time to remove it from the file entirely.
- `data.csv`, `map.ts`, etc.: Auxiliary files for the post. Any code or data needed for research goes here, never inline in the `## Scratch` section.
