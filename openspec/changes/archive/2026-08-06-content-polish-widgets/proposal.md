## Why

`abf-k7d.1` asked for an audit of what content-polish reading aids (table of contents, footnotes, callouts, image galleries) already exist via the repo's markdown-shortcode pattern, and for the pattern to be extended to cover the gaps.
The audit (this session, 2026-08-04) found the epic's framing was only partially accurate: table of contents already works today (Astro-native `getHeadings()` + `rehypeSlug`, not the remark-shortcode pattern), callouts already work, and image galleries/lightbox are greenfield work with a different shape (asset pipeline + interactive React island) that got split into a separate epic (`abf-k7d.5`).
What's left as a genuine, scoped gap: footnotes don't exist at all (no plugin, no post uses `[^1]` syntax), and the existing table of contents has no active/current-heading indication as the reader scrolls.

## What Changes

- Add GFM footnote syntax support (`[^1]` reference / `[^1]: text` definition) via `remark-gfm`, styled with the Tier-3 design tokens `abf-k7d.3` landed in `src/styles/global.css`. This does not follow the callout/math/mermaid remark-plugin-to-JSX-component pattern — `mdast-util-to-hast` converts GFM footnote nodes to semantic HTML (`<sup>`, `<section data-footnotes role="doc-endnotes">`) natively, so this is a syntax extension plus CSS, not a new component.
- Convert `src/components/TableOfContents.astro` (currently static, logic-free) into a React component with an `IntersectionObserver`-based scroll-spy: the heading nearest the top of the viewport gets `aria-current="location"` on its corresponding TOC link. Follows this repo's Astro-glue/React-logic convention since scroll-spy is stateful client-side behavior.
- No change to callouts, math, or mermaid — already fully working, out of scope.
- No change to image galleries/lightbox — split into `abf-k7d.5`, a separate epic with its own design phase.

## Capabilities

### New Capabilities
- `content-polish-widgets`: the set of reading-aid widgets available to blog posts and their authoring mechanism (markdown syntax where possible, native HTML/CSS or React where the shortcode-to-JSX pattern doesn't fit). Covers footnote support and TOC active-heading indication as its first two requirements; callouts/math/mermaid remain implicitly covered by existing code but aren't re-specified here since their behavior isn't changing.

### Modified Capabilities
- None. `openspec/specs/` currently has `blog-planning-via-beads` and `ui-design-tokens`, neither of which covers content widgets.

## Impact

- `astro.config.mjs`: `remarkPlugins` list (both the `mdx()` integration config and the top-level `markdown` config) gains `remark-gfm`.
- `src/styles/global.css`: gains footnote-section styling (divider, muted back-link) using existing Tier-3 tokens — no new tokens needed.
- `src/components/TableOfContents.astro` → `src/components/TableOfContents.tsx` (or a thin `.astro` wrapper hydrating a new `.tsx`, exact shape is a design decision): gains `IntersectionObserver` scroll-spy logic and an Astro client directive.
- `package.json` / `bun.lock`: new dependency `remark-gfm` — `bunfig.toml`'s `minimumReleaseAge` needs checking per repo convention.
- No blog post content changes required; footnote syntax is opt-in per post going forward.
- Verification: `bun start` + manual check of scroll-spy behavior on a long post, plus a new post (or an existing draft) exercising `[^1]` footnote syntax in both light and dark mode.
