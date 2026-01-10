# Blog agent instructions

This directory contains the user's blog posts and research ideas.

## Structure
- Each post must have its own folder following the naming convention: `YYYY-MM-DD_slug`.
- The date in the folder name represents the **Conception Date** (when the idea was started), not necessarily the publication date.
- The `slug` should be kebab-case and descriptive.

## Workflow & lifecycle

### 1. Ideation (notebook phase)
- **Goal:** Brainstorming, collecting links, rough outlines.
- **Action:** Create a new folder with the `YYYY-MM-DD_slug` convention.
- **File:** Create `notebook.md` inside this folder.
- **Constraint:** Do **NOT** create `index.mdx` yet.
  - The absence of `index.mdx` keeps the post hidden from the site build.
  - You may edit `notebook.md` freely.

### 2. Drafting
- **Trigger:** The user explicitly asks to start writing the draft.
- **Action:** Create `index.mdx` in the same folder.
- **Content:** Use `notebook.md` as your source material/reference.
- **Metadata:** Set `status: draft` in the frontmatter.

### 3. Publishing
- **Action:** Update `status: published` in `index.mdx`.
- **Constraint:** The `notebook.md` file stays in the folder as a permanent record of the research. Do not delete it unless asked.
- **Freezing:** Treat `notebook.md` as "frozen" or read-only once drafting begins, unless the user wants to add new research notes.

## Files
- `notebook.md`: Scratchpad for ideas. Ignored by the build.
- `index.mdx`: The actual blog post content.
- `data.csv`, `map.ts`, etc.: Auxiliary files for the post.
