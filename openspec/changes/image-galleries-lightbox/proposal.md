## Why

`abf-k7d.5` asked whether blog posts can embed images with sensible optimization and, for multiple images, a gallery/lightbox view — without hand-authored JSX per post.
A fresh audit (this session, 2026-08-06) confirmed this is genuinely greenfield: no post under `src/content/blog/**/index.mdx` embeds an image today (checked all 10 posts, including `## Scratch` sections), `astro:assets` is unused anywhere in `src/`, and `src/content.config.ts`'s frontmatter schema has no image field.
There's no existing image-authoring convention to extend or stay consistent with — this proposal has to establish one from scratch.

## What Changes

- Wire Astro's built-in Markdown/MDX image optimization (`astro:assets` under the hood) so plain `![alt](./photo.jpg)` syntax in a post's `index.mdx`, referencing an image colocated in the same post folder, is automatically optimized (responsive `srcset`, modern formats) with zero new authoring syntax.
- Add a `Gallery` React component (`src/components/Gallery.tsx`, following the `EChart`/`PigeonMap` hand-authored-widget precedent, not the remark-shortcode-to-component pattern — see design.md for why) for posts that want multiple images shown together in a grid.
- Add a lightbox: clicking any optimized post image (single or within a `Gallery`) opens a full-size modal view with keyboard/backdrop dismiss and, inside a gallery, next/previous navigation.
- No change to `content.config.ts`'s frontmatter schema — this proposal covers in-body images only, not a `heroImage`/`cover` frontmatter field (that remains unscoped; out of scope here, see design.md Non-Goals).

## Capabilities

### New Capabilities
- `post-images`: how blog posts embed images in body content, covering the optimization pipeline for single images (plain markdown syntax), the `Gallery` component for multiple images, and the lightbox interaction for viewing any embedded image at full size.

### Modified Capabilities
- None. `openspec/specs/` currently has `blog-planning-via-beads`, `content-polish-widgets`, and `ui-design-tokens` — none cover image embedding.

## Impact

- `src/content/blog/<post>/`: posts may now colocate image files alongside `index.mdx` (or `notebook.md`) and reference them with relative markdown image syntax.
- `src/components/Gallery.tsx` (new): React component for multi-image grid layout.
- `src/components/Lightbox.tsx` (new, exact shape decided in design.md): React component/hook providing the full-size modal view, shared by both single-image and `Gallery` click targets.
- `src/lib/mdx-components.tsx`: gains a `Gallery` registration so it's usable directly in MDX body content.
- `package.json` / `bun.lock`: likely gains `@headlessui/react`-based Dialog usage (already a dependency, no new package) — confirmed during design.md whether any new dependency is needed at all.
- No change to `astro.config.mjs`'s remark/rehype plugin lists — single-image optimization is Astro's built-in Markdown/MDX image handling, not a new remark plugin.
- Verification: `bun start` + manually add a real image (or a placeholder asset) to a draft/scratch post and confirm optimized output, gallery grid layout, and lightbox open/close/navigate in both light and dark mode.
