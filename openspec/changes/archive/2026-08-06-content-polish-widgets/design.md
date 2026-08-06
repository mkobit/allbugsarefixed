## Context

`abf-k7d.1`'s audit (2026-08-04) found the existing content-polish mechanism is a remark-plugin-to-JSX-component pattern: a remark plugin matches markdown/MDX AST for some syntax (Obsidian-style callout blockquotes, LaTeX delimiters, mermaid code fences) and rewrites the matched node into an `mdxJsxFlowElement`/`mdxJsxTextElement` referencing a React component, registered either globally in `src/lib/mdx-components.tsx` (`Callout`, `CodeBlock`) or ad hoc at the render call site in `src/pages/blog/[...slug].astro` (`Mermaid`, `Latex`).

Two gaps remain in scope after the audit narrowed the epic (TOC and callouts already work; images split to `abf-k7d.5`):

- **Footnotes**: no mechanism exists. `package.json` has no `remark-gfm`/`remark-footnotes`; zero posts use `[^1]` syntax.
- **TOC active-heading indication**: the TOC itself already works (`src/components/TableOfContents.astro`, fed by Astro's native `getHeadings()` + `rehype-slug` heading IDs), but it's a static list with no indication of reading position.

Neither gap fits the remark-plugin-to-JSX-component pattern cleanly: footnotes are a markdown *syntax* extension with a native HTML target (no component needed), and TOC scroll-spy is client-side *runtime* behavior on an already-rendered sidebar (no markdown involved at all).

## Goals / Non-Goals

**Goals:**
- Add footnote syntax support usable in any post's real content, styled consistently with existing design tokens.
- Add accessible active-heading indication to the existing table of contents.
- Keep both additions consistent with this repo's Astro-glue/React-logic split and its existing remark-plugin conventions where they actually apply.

**Non-Goals:**
- Callouts, math, mermaid: unchanged.
- Image galleries/lightbox: out of scope, tracked as `abf-k7d.5`.
- Table/strikethrough/task-list/autolink rendering *quality* (styling, edge cases) beyond "doesn't break": `remark-gfm` activates these as a side effect of enabling footnotes (see Decisions), but no styling or feature work is being done for them — they're accepted as unstyled/default-prose-styled if a future post happens to use them.
- A footnote-specific JSX component with custom interaction (e.g. hover-preview popovers). Native semantic HTML + CSS only, for now.

## Decisions

### Footnotes: `remark-gfm`, not a bespoke shortcode plugin, not a hand-wired micromark extension

Use `remark-gfm@^4.0.1` (2025-02-10, clears `bunfig.toml`'s 14-day `minimumReleaseAge` by well over a year — no exception needed) added to both `remarkPlugins` arrays in `astro.config.mjs` (the `mdx()` integration config and the top-level `markdown` config, matching how every other remark plugin here is dual-registered per the existing comment on lines 22-25 explaining why).

**Why not follow the callout/math/mermaid pattern (custom remark plugin → JSX component)?** `mdast-util-to-hast` (already in the pipeline via `remark-rehype`/Astro's markdown pipeline) converts GFM `footnoteReference`/`footnoteDefinition` mdast nodes into standard hast nodes — `<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup>` at the reference, and a `<section data-footnotes class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2><ol>...<a data-footnote-backref>↩</a></ol></section>` at the document end — automatically, with zero additional code. A custom plugin would be reinventing what the ecosystem already does correctly, including the accessibility affordances (backref links, `sr-only` section label).

**Why `remark-gfm` and not the narrower `micromark-extension-gfm-footnote` + `mdast-util-gfm-footnote` pair it's built from?** Hand-wiring just the footnote extension avoids activating GFM's other syntax (tables, strikethrough, task lists, autolink literals) as a side effect, but costs more code (two extra deps, manual micromark/mdast-util wiring instead of one battle-tested package) to buy isolation this repo doesn't currently need. Verified: grepped every `src/content/blog/**/index.mdx` for `~~`, pipe-table syntax, task-list syntax, and bare URLs. Exactly two matches — a pipe table in `2026-01-13_the-hidden-costs-of-flexible-time-off/index.mdx:52-56` and a bare URL in `2026-03-14_bot-and-fraud-tsunami-in-tech/index.mdx:15` — both inside `## Scratch` (stripped pre-render by `remarkStripScratch`) in posts with `visibility: "hidden"`. Zero production rendering-behavior change today. If a future post's real content happens to use `~~strikethrough~~`-looking text or an unintentional table-like line, `remark-gfm` would change its rendering — accepted as a known trade-off (see Risks), not worth the extra dependency surface to fully avoid.

**Styling**: add a `.footnotes`/`[data-footnotes]` rule to `src/styles/global.css` using the Tier-3 tokens `abf-k7d.3` already landed (muted-text and subtle-border tokens for the divider and note text) — no new tokens needed.

### TOC scroll-spy: `IntersectionObserver`, not CSS scroll-snap

Checked `modern-web-guidance` first (mandatory for client-side JS per this repo's `AGENTS.md`). No exact-match guide for "highlight nearest heading in a long-scrolling article." Closest guide, `scroll-snap-state-sync`, describes exactly this "active TOC section" use case via the native `scrollsnapchange` event — but its mechanism requires `scroll-snap-type`/`scroll-snap-align` configured on the *main content flow*, i.e. the article body itself would need to become a scroll-snap container with headings as snap targets. Rejected: that would impose snapping behavior on continuous prose reading (jarring — the browser would try to "settle" scroll position onto heading boundaries), a UX change nobody asked for, purely to get a side benefit. `scrollsnapchange` is also Chrome/Edge-only (Sept 2024+), not Baseline widely available — the guide's own fallback for Firefox/Safari is `IntersectionObserver`.

Decision: implement directly via `IntersectionObserver`, skipping scroll-snap entirely. Observe the post body's heading elements (same depth <=3 filter `TableOfContents.astro` already applies), track whichever observed heading is nearest the top of the viewport per the guide's documented algorithm (compare `getBoundingClientRect().bottom` across intersecting entries), and set `aria-current="location"` plus a visual treatment on that heading's corresponding TOC link — matching the guide's accessibility note that active state must be reflected in the accessibility tree, not just visually.

**Why this requires a React component, not more `.astro` markup:** `TableOfContents.astro` today is static — no `<script>`, no client state. Scroll-spy is inherently stateful (tracks "which heading is currently active" and updates on scroll), which is exactly the kind of logic this repo's `AGENTS.md` assigns to React (`Astro files should act as "glue" code... Avoid heavy business logic... in .astro files`). Introduce `src/components/TableOfContents.tsx`, a React port of the current `.astro` markup plus a `useEffect`-based `IntersectionObserver`, hydrated with `client:visible` (the TOC sidebar is typically already in or near the viewport on load for a long article, so `client:visible` hydrates promptly without competing for main-thread time during initial page load the way `client:load` would). `[...slug].astro` swaps its `<TableOfContents />` import and usage accordingly.

## Risks / Trade-offs

- **[Risk]** `remark-gfm` silently changes rendering of any *future* post content that happens to contain `~~text~~`, a bare URL, or accidental pipe-table-shaped lines, not just intentional footnote syntax. → **Mitigation**: documented as a known trade-off above; audited current content and found zero production impact; the failure mode (unexpected table/strikethrough rendering) is visually obvious in a `bun start` preview before publish, not a silent data-correctness bug.
- **[Risk]** `IntersectionObserver` threshold/margin tuning is finicky — naive configurations either flicker between two headings near a boundary or fail to activate the last heading when it's short and near the page bottom. → **Mitigation**: use the `modern-web-guidance` guide's documented algorithm (pick the entry with the smallest positive `bottom`, not a fixed intersection ratio threshold), which is specifically designed to handle both scrolling directions and short trailing sections; validate manually against the longest existing post during implementation.
- **[Risk]** Converting `TableOfContents.astro` to a React island adds client-side JS bundle weight and a hydration boundary that didn't exist before, on every post that has a TOC. → **Mitigation**: `client:visible` defers hydration cost off the critical initial-render path; the component itself is small (a heading list plus one `IntersectionObserver`), no new heavy dependency.

## Adversarial review and mitigations

- **Objection: "The epic asked to extend the shortcode pattern — footnotes bypassing it entirely is scope drift from the stated goal, not a gap-fill."** → Mitigation: the epic's own framing is explicitly non-binding on mechanism ("Not yet decided... whether every gap fits the existing remark-plugin approach or some need a different mechanism" — `abf-k7d.1`'s description). The audit is exactly the process the epic asked for, and it found footnotes fit a simpler, more standard mechanism than the shortcode pattern. Forcing footnotes through a JSX component would mean re-implementing accessibility affordances (backrefs, `sr-only` labels) that `mdast-util-to-hast` already provides correctly — worse, not more consistent.
- **Objection: "`remark-gfm` is one atomic dependency — what if a later, unrelated change wants tables or task lists with actual styling, and by then this design's 'no styling for those' non-goal is stale and forgotten?"** → Mitigation: this design doesn't hide the fact that `remark-gfm` is active; `astro.config.mjs`'s plugin list and this design doc both name it explicitly (not "secretly enabled as a side effect of an unrelated import"). A future proposal that wants real table/task-list support finds `remark-gfm` already installed and only needs to add styling — cheaper than today's alternative of discovering it's missing.
- **Objection: "Two matches found in the content grep isn't proof of zero risk — what about posts that don't exist yet, or content inside code fences that the grep's naive `grep -rn '|'` might have mis-scanned?"** → Mitigation: correct that the audit only covers *existing* content, not future posts — that risk is accepted and documented (see Risks), not eliminated. On code-fence contamination: the one pipe-table match found was manually inspected in context (`design.md`'s Decisions section above cites exact line numbers) and confirmed to be inside `## Scratch`, not a code fence; the grep for bare URLs similarly excluded matches inside `<...>` or `](...)`. Not exhaustive, but proportionate to a personal blog with under a dozen posts, all inspected by hand here.
- **Objection: "`client:visible` means the TOC's scroll-spy might not hydrate at all if the reader loads the page already scrolled past the TOC's viewport position (e.g. via a deep link to a heading anchor) — first active-heading update could be delayed or missed."** → Mitigation: `client:visible` uses an `IntersectionObserver` on the component itself (Astro's implementation), which fires as soon as any part of the TOC sidebar enters the viewport — for a typical sidebar layout, that's on initial paint for most viewport sizes, and worst case (TOC scrolled fully out of view) the reader sees the static list immediately and gets active-heading indication once they scroll the sidebar into view, which is an acceptable degradation, not a broken state (spec's "JavaScript fails to load" scenario already requires the static fallback to be fully functional on its own).
- **Objection: "Does `remark-gfm`'s footnote HTML output pass this repo's a11y/lint bar, or does it need `aria-label`/`role` overrides this design doesn't mention?"** → Mitigation: `mdast-util-to-hast`'s default footnote output already includes `role="doc-endnotes"` on the section, a `sr-only` heading labeled "Footnotes", and `aria-label="Back to reference N"`-equivalent text on backrefs — these are configurable (`footnoteLabel`, `footnoteBackLabel` options) but the defaults are already accessible; no override needed unless a future non-English-content requirement arises, which isn't the case for this blog today.

## Migration Plan

No data migration. Deploy as a normal PR:
1. Add `remark-gfm` dependency, wire into `astro.config.mjs`.
2. Add footnote CSS to `global.css`.
3. Introduce `TableOfContents.tsx`, swap the import in `[...slug].astro`, delete the now-unused `.astro` version.
4. Verify via `bun start` against the longest existing post (manual scroll-through) and a scratch/test post exercising footnote syntax.
5. No rollback complexity beyond a normal revert — nothing is stateful or irreversible.

## Open Questions

- None blocking. The one soft judgment call (`client:visible` vs. `client:idle` for the TOC hydration directive) is decided above with rationale; revisit only if manual testing during implementation shows a real problem with the chosen directive.
