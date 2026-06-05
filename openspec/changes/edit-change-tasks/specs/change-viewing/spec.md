## MODIFIED Requirements

### Requirement: Render the change in a three-tab viewer

The system SHALL present a loaded change in a three-tab interface — Proposal, Design, Tasks — with a system-following light/dark theme. The Tasks tab is interactive: task checkboxes, inline text editing, delete, and add act on the change's `tasks.md` (see the `task-editing` capability). Existing comments remain read-only.

#### Scenario: Switching tabs

- **WHEN** the user selects the Proposal, Design, or Tasks tab
- **THEN** the corresponding rendered content is shown without reloading the change

#### Scenario: Interactive task list

- **WHEN** the Tasks tab is shown
- **THEN** checkboxes reflect the parsed done state and can be toggled, task text can be edited inline, tasks can be deleted or added, and existing comments are visible read-only
