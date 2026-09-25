## MODIFIED Requirements

### Requirement: Stack the app bar on phone widths

At viewport widths of 640px or less the system SHALL lay out the app bar so that the Project and Change selects each take a full-width row, one below the other, the Changes/Worktrees/Project workspace tabs sit on the brand row beside the theme toggle, and the "Show archived" checkbox and the Active/Archived badge share one row. The brand SHALL show only its logo at these widths, so the three tabs fit. The page SHALL NOT scroll horizontally.

#### Scenario: Phone width with a change selected

- **WHEN** the viewport is 390px wide, a project and a change are selected, and the project has archived changes
- **THEN** the app bar shows four rows: logo, the three workspace tabs and theme toggle; the Project select at full width; the Change select at full width; the "Show archived" checkbox with the status badge at the row's right end — and the page has no horizontal scrollbar

#### Scenario: All workspace tabs visible on a small phone

- **WHEN** the viewport is 360px wide and a project is selected
- **THEN** the Changes, Worktrees and Project tabs are all fully visible on the brand row, left of the theme toggle

#### Scenario: Phone width on the Worktrees tab

- **WHEN** the viewport is 390px wide and the Worktrees tab is active
- **THEN** the app bar shows the brand row and the full-width Project select only, with no empty row where the Change select and checkbox would be

#### Scenario: Tablet width keeps the side-by-side pickers

- **WHEN** the viewport is 768px wide
- **THEN** the pickers row wraps under the brand as one full-width row with the Project select, Change select, checkbox and workspace tabs side by side, as before this change

#### Scenario: Desktop width unchanged

- **WHEN** the viewport is wider than 768px
- **THEN** the app bar is a single row: brand, centered pickers, badge and theme toggle
