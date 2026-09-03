## ADDED Requirements

### Requirement: Stack the app bar on phone widths

At viewport widths of 640px or less the system SHALL lay out the app bar so that the Project and Change selects each take a full-width row, one below the other, the Changes/Worktrees workspace tabs sit on the brand row beside the theme toggle, and the "Show archived" checkbox and the Active/Archived badge share one row. The brand subtitle SHALL be hidden at these widths. The page SHALL NOT scroll horizontally.

#### Scenario: Phone width with a change selected

- **WHEN** the viewport is 390px wide, a project and a change are selected, and the project has archived changes
- **THEN** the app bar shows four rows: logo, name, workspace tabs and theme toggle; the Project select at full width; the Change select at full width; the "Show archived" checkbox with the status badge at the row's right end — and the page has no horizontal scrollbar

#### Scenario: Phone width on the Worktrees tab

- **WHEN** the viewport is 390px wide and the Worktrees tab is active
- **THEN** the app bar shows the brand row and the full-width Project select only, with no empty row where the Change select and checkbox would be

#### Scenario: Tablet width keeps the side-by-side pickers

- **WHEN** the viewport is 768px wide
- **THEN** the pickers row wraps under the brand as one full-width row with the Project select, Change select, checkbox and workspace tabs side by side, as before this change

#### Scenario: Desktop width unchanged

- **WHEN** the viewport is wider than 768px
- **THEN** the app bar is a single row: brand, centered pickers, badge and theme toggle

### Requirement: Hover-revealed task controls are visible on devices that cannot hover

The system SHALL show each task's drag handle and delete button permanently on devices whose primary input cannot hover, and SHALL keep revealing them on hover on devices that can.

#### Scenario: Touch device

- **WHEN** the Tasks tab is viewed on a device that reports no hover capability
- **THEN** every task row shows its drag handle and delete button without any interaction

#### Scenario: Mouse device

- **WHEN** the Tasks tab is viewed on a device with hover capability
- **THEN** a task row's drag handle and delete button appear only while the row is hovered, as before this change

### Requirement: Task row controls have touch-sized hit areas on coarse pointers

On devices with a coarse primary pointer the system SHALL give the drag handle and the task checkbox a hit area of at least 40×40 CSS pixels without enlarging their visual mark or the row's height.

#### Scenario: Tapping the checkbox on a phone

- **WHEN** the user taps within 40×40px around a task's checkbox on a coarse-pointer device
- **THEN** the task toggles, and the row is the same height as on a fine-pointer device

#### Scenario: Dragging from the handle on a phone

- **WHEN** the user presses within the handle's hit area and moves more than 5px
- **THEN** a drag starts and the page does not scroll while the finger moves

### Requirement: Task add row and comment threads fit a phone

At viewport widths of 640px or less the system SHALL place the add-task input on its own full-width row with the Add and Cancel buttons on the row beneath it, and SHALL reduce the comment thread's left indent so that threads keep most of the content width.

#### Scenario: Adding a task on a phone

- **WHEN** the user opens the add-task row at 390px
- **THEN** the input spans the full content width and Add and Cancel appear below it, both fully visible

#### Scenario: Reading comments on a phone

- **WHEN** a task with comments is shown at 390px
- **THEN** the comment thread starts at the checkbox column, not 47px in, and its text wraps within the content width

### Requirement: Prose tables scroll within the content

The system SHALL render every markdown table inside a block that scrolls horizontally when the table is wider than the content area, so that a wide table never widens the page.

#### Scenario: Wide table in a proposal

- **WHEN** a proposal contains a pipe table whose columns exceed the content width
- **THEN** the table scrolls horizontally inside its wrapper and the page itself has no horizontal scrollbar

#### Scenario: Renderer output

- **WHEN** `renderMarkdown` is given a pipe table
- **THEN** the emitted HTML wraps the `<table>` in a single `<div class="tableWrap">`, and non-table content is emitted as before

### Requirement: Worktree cards and review mode fit a phone

At viewport widths of 640px or less the system SHALL wrap a worktree card's head and action row so that long branch names and the button set never overflow the card, and in review mode SHALL NOT pad the nested change viewer twice.

#### Scenario: Long branch name

- **WHEN** a worktree on branch `change/add-worktree-management` is listed at 390px
- **THEN** the branch name breaks or wraps inside the card and the status label and token count remain visible

#### Scenario: Card actions

- **WHEN** a non-main worktree card with a reviewable change is shown at 390px
- **THEN** "Open in VS Code", "Review" and the remove button are all visible, wrapping to a second line if needed

#### Scenario: Review mode padding

- **WHEN** a worktree's change is opened for review at 390px
- **THEN** the change content has the same horizontal padding as the Changes tab, not the review container's padding added on top
