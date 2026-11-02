## ADDED Requirements

### Requirement: Responsive widgets use container queries
Component-level responsive adaptations SHALL use container queries (`@container`) instead of viewport media queries.
Parent containers for responsive widgets SHALL declare `container-type: inline-size`.
Components SHALL adapt layout columns and typography based on parent container width.

#### Scenario: Rendering a card widget in different layout widths
- **WHEN** a card widget renders inside a narrow sidebar or a full-width column
- **THEN** its internal layout adapts to container width without relying on viewport media queries

### Requirement: Multi-column card grids align content with CSS subgrid
Multi-column card collections SHALL use `grid-template-rows: subgrid` to align card sections.
Titles, body copy, and footers SHALL share row tracks with neighboring cards in the same grid.
Card layouts SHALL NOT use JavaScript measurements to equalize card heights.

#### Scenario: Displaying cards with variable text lengths
- **WHEN** adjacent cards in a grid have different title lengths
- **THEN** the metadata and footer rows remain vertically aligned across cards

### Requirement: Parent styling responds to child state with :has()
Containers and table rows SHALL use `:has()` to apply styles based on descendant element states.
Heading elements SHALL use `:has(:hover)` or parent `:has()` selectors to reveal anchor links.
Components SHALL NOT inject imperative modifier classes into parent DOM nodes to reflect child states.

#### Scenario: Hovering an anchor heading container
- **WHEN** a reader hovers over a heading container
- **THEN** `:has()` activates visibility of the anchor link icon

### Requirement: Scroll indicators use CSS scroll-driven animations
Scroll progress indicators SHALL use native CSS scroll timelines (`animation-timeline: scroll()`).
The progress indicator SHALL be implemented without main-thread JavaScript scroll listeners.
The component SHALL run on the browser compositor thread.

#### Scenario: Scrolling a post page
- **WHEN** a user scrolls vertically through a blog post
- **THEN** the scroll indicator advances proportionally with zero JavaScript execution

### Requirement: Modal dialogs and overlays use native HTML APIs
Image lightboxes and modal overlays SHALL use the native HTML `<dialog>` element.
Transient menus and dropdowns SHALL use the HTML Popover API with light dismiss.
Modal open and close animations SHALL use `@starting-style` and discrete property transitions.

#### Scenario: Opening an image in a lightbox
- **WHEN** a reader clicks a zoomable image
- **THEN** the browser opens a top-layer `<dialog>` with focus trapping and animated `@starting-style` transitions
