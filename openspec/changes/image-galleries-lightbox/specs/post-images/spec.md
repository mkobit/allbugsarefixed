## ADDED Requirements

### Requirement: Single image optimization via plain markdown syntax
The system SHALL render a locally colocated image referenced with plain markdown syntax (`![alt](./relative-path)`) in a post's MDX body as an optimized, responsive image, without requiring a hand-authored JSX component for the single-image case.

#### Scenario: Post embeds one image with markdown syntax
- **WHEN** an MDX post's body contains `![A red bicycle](./bicycle.jpg)` and `bicycle.jpg` is colocated in that post's content folder
- **THEN** the rendered page serves an optimized image (responsive `srcset`, format negotiation) at that point in the content, using the provided text as the accessible alt text

#### Scenario: Referenced image file does not exist
- **WHEN** an MDX post's body references a local image path that does not exist in that post's content folder
- **THEN** `bun run build` SHALL fail with an error identifying the missing file, rather than shipping a broken image reference

### Requirement: Gallery component for multiple images
The system SHALL provide a `Gallery` component, usable directly in MDX body content, that renders a set of plain-markdown-syntax images (given as its children) as a grid, with each image individually alt-texted and individually optimized.

#### Scenario: Post embeds a gallery of multiple images
- **WHEN** an MDX post's body contains a `<Gallery>` element wrapping multiple plain markdown images (e.g. `![A red bicycle](./a.jpg)` and `![A blue bicycle](./b.jpg)` as children), with both files colocated in that post's content folder
- **THEN** the rendered page shows both images laid out in a grid, each individually alt-texted, each receiving the same image optimization as a standalone embedded image, without `Gallery` itself performing any image resolution

### Requirement: Lightbox for full-size image viewing
The system SHALL let a reader click any embedded post image (standalone or within a `Gallery`) to open a full-size modal view of that image, dismissible via keyboard or backdrop interaction.

#### Scenario: Reader clicks a standalone embedded image
- **WHEN** a reader clicks an image embedded via plain markdown syntax
- **THEN** a modal opens showing that image at full size, with no next/previous navigation controls (single-image set)

#### Scenario: Reader activates a standalone embedded image via keyboard
- **WHEN** a reader tabs to a standalone embedded image's click target and presses Enter or Space
- **THEN** the same modal opens as the mouse-click scenario, since the click target is a focusable, keyboard-operable element (not a bare, non-interactive `<img>`)

#### Scenario: Reader clicks an image within a gallery
- **WHEN** a reader clicks one of the images rendered by a `Gallery` component
- **THEN** a modal opens showing that image at full size, with next/previous controls that navigate to the adjacent images in that same `Gallery`'s image set, in the order they were declared

#### Scenario: Reader dismisses the lightbox
- **WHEN** the lightbox modal is open and the reader presses Escape or clicks the backdrop outside the image
- **THEN** the modal closes and focus returns to the image element that opened it

#### Scenario: Reader navigates the lightbox via keyboard
- **WHEN** the lightbox modal is open for a gallery image and the reader presses the left or right arrow key
- **THEN** the modal updates to show the previous or next image in that gallery's set respectively, without closing

#### Scenario: JavaScript fails to load or is disabled
- **WHEN** the client-side lightbox script does not execute (disabled JS, script error, or hydration not yet complete)
- **THEN** the embedded image still renders inline at its normal optimized size — the lightbox is a progressive enhancement, not a requirement for viewing the image's content
