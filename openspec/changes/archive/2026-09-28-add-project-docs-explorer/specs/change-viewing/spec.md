## ADDED Requirements

### Requirement: Load a change's delta specs

The system SHALL load the raw markdown of every `specs/<capability>/spec.md` inside a selected change, ordered by capability name. A capability folder without a `spec.md` SHALL be skipped, and a change without a `specs/` folder SHALL expose an empty list rather than an error.

#### Scenario: A change with two delta specs

- **WHEN** a change has `specs/session/spec.md` and `specs/auth/spec.md`
- **THEN** the system exposes both, `auth` first, each with its capability name and raw markdown

#### Scenario: A change without specs

- **WHEN** a change has no `specs/` folder
- **THEN** the system exposes an empty list of specs

## MODIFIED Requirements

### Requirement: Render the change in a three-tab viewer

The system SHALL present a loaded change in a four-tab interface — Proposal, Specs, Design, Tasks — with a system-following light/dark theme. The Specs tab SHALL render one delta spec at a time; when the change has more than one, a capability picker SHALL select which one is shown. The Tasks tab is interactive: task checkboxes, inline text editing, delete, add, and drag-to-reorder act on the change's `tasks.md` (see the `task-editing` capability). Existing comments remain read-only.

#### Scenario: Switching tabs

- **WHEN** the user selects the Proposal, Specs, Design, or Tasks tab
- **THEN** the corresponding rendered content is shown without reloading the change

#### Scenario: Picking a capability

- **WHEN** the change has delta specs for `auth` and `session` and the user opens the Specs tab
- **THEN** the `auth` spec is rendered with a picker listing both capabilities, and choosing `session` renders that spec instead

#### Scenario: A change without specs

- **WHEN** the change has no delta specs and the user opens the Specs tab
- **THEN** the tab shows an empty state instead of failing

#### Scenario: Interactive task list

- **WHEN** the Tasks tab is shown
- **THEN** checkboxes reflect the parsed done state and can be toggled, task text can be edited inline, tasks can be deleted, added, or reordered, and existing comments are visible read-only

#### Scenario: An edit keeps the active tab

- **WHEN** the user toggles, edits, deletes, adds, or reorders a task on the Tasks tab (which reloads the change from disk)
- **THEN** the viewer stays on the Tasks tab — the reload does not reset the active tab to Proposal

#### Scenario: A completed task is not struck through

- **WHEN** a task is marked done
- **THEN** its text is shown muted (not struck through) — the checked checkbox conveys completion
