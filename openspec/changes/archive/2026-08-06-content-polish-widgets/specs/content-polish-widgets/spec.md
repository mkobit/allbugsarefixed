## ADDED Requirements

### Requirement: Footnote support
The system SHALL render GFM footnote syntax (`[^label]` reference in body text, `[^label]: definition text` block) in blog post MDX content as semantic HTML: an inline superscript reference link and a definitions section with backlinks, without requiring a hand-authored JSX component per post.

#### Scenario: Post uses a footnote reference and definition
- **WHEN** an MDX post contains `some claim[^1]` in its body and `[^1]: supporting detail` elsewhere in the same document
- **THEN** the rendered page shows a superscript link at the reference point that jumps to a definitions section at the point `[^1]:` was defined, and that definition includes a backlink that returns to the reference point

#### Scenario: Post defines a footnote that is never referenced
- **WHEN** an MDX post contains `[^orphan]: unused note` but no `[^orphan]` reference anywhere in the body
- **THEN** the build SHALL NOT fail, consistent with standard GFM footnote handling (unreferenced definitions are simply not rendered)

#### Scenario: Footnote syntax used inside the reserved Scratch section
- **WHEN** an MDX post's `## Scratch` section contains footnote syntax
- **THEN** it is stripped by `remarkStripScratch` before footnote processing has any rendering effect, consistent with every other syntax extension's behavior inside `## Scratch`

### Requirement: Table of contents active-heading indication
The system SHALL indicate, within the table-of-contents sidebar rendered alongside a blog post, which heading corresponds to the reader's current scroll position, using an accessible mechanism.

#### Scenario: Reader scrolls through a post with multiple headings
- **WHEN** a reader scrolls a published post so that a heading other than the first becomes the topmost heading within the viewport
- **THEN** the table-of-contents link corresponding to that heading receives `aria-current="location"` and a distinct visual treatment, and the previously active link loses both

#### Scenario: Post has no headings deep enough to appear in the table of contents
- **WHEN** a post has zero headings at depth <= 3 (the existing table-of-contents depth filter)
- **THEN** no table of contents is rendered and no scroll-spy behavior runs, consistent with current behavior for such posts

#### Scenario: JavaScript fails to load or is disabled
- **WHEN** the client-side scroll-spy script does not execute (disabled JS, script error)
- **THEN** the table of contents still renders as a static, fully functional list of anchor links with no active-heading indication — scroll-spy is a progressive enhancement, not a requirement for basic navigation
