# change-viewing Specification

## Purpose
TBD - created by archiving change view-project-changes. Update Purpose after archive.
## Requirements
### Requirement: Load a change's proposal and design

The system SHALL load the raw markdown of a selected change's `proposal.md` and `design.md` for rendering. A missing artifact is exposed as absent rather than as an error.

#### Scenario: Proposal and design are present

- **WHEN** a change has `proposal.md` and `design.md`
- **THEN** the system exposes the raw markdown of each for the Proposal and Design tabs

#### Scenario: Design is absent

- **WHEN** a change has no `design.md`
- **THEN** the system exposes the design as absent, and the Design tab shows an empty state instead of failing

### Requirement: Parse the task list

The system SHALL parse the change's `tasks.md` into ordered task groups. Each group has a title (the `## N. Group` heading) and a list of tasks. Each task has an id, text, and a done state derived from its checkbox (`- [ ]` = not done, `- [x]` = done).

#### Scenario: Grouped, numbered tasks

- **WHEN** `tasks.md` contains `## 1. Setup` followed by `- [x] 1.1 Do thing` and `- [ ] 1.2 Other thing`
- **THEN** the system returns a group "1. Setup" with task `1.1` (done) and task `1.2` (not done), preserving order

#### Scenario: Content written under a task

- **WHEN** a task line is followed by indented lines — a wrapped continuation of its text, or a fenced code block
- **THEN** those lines are exposed as the task's details (dedented, `ui:comment` blocks excluded) and rendered as markdown under the task on the Tasks tab

#### Scenario: Details travel with their task

- **WHEN** a task with details is reordered, deleted, or a new task is added after it
- **THEN** its indented lines and comment blocks move or are removed together with the task line, and a new task is inserted after them, never between a task and its details

#### Scenario: Completion progress

- **WHEN** a change's parsed tasks have a mix of done and not-done items
- **THEN** the system exposes the done count, total count, and completion percentage

#### Scenario: Change without a task list

- **WHEN** a change has no `tasks.md`
- **THEN** the Tasks tab shows an empty state rather than failing

### Requirement: Expose existing task comments read-only

The system SHALL parse inline comment blocks attached to a task — delimited by `<!-- ui:comment … -->` and `<!-- /ui:comment -->` markers beneath the task line — and expose each as a comment with its author, timestamp, and text for read-only display.

#### Scenario: Task with existing comments

- **WHEN** a task line is followed by one or more `ui:comment` blocks
- **THEN** the system attaches those comments (author, when, text) to that task for display

#### Scenario: Task without comments

- **WHEN** a task has no `ui:comment` blocks
- **THEN** the task exposes an empty comment list

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

### Requirement: Load a change's delta specs

The system SHALL load the raw markdown of every `specs/<capability>/spec.md` inside a selected change, ordered by capability name. A capability folder without a `spec.md` SHALL be skipped, and a change without a `specs/` folder SHALL expose an empty list rather than an error.

#### Scenario: A change with two delta specs

- **WHEN** a change has `specs/session/spec.md` and `specs/auth/spec.md`
- **THEN** the system exposes both, `auth` first, each with its capability name and raw markdown

#### Scenario: A change without specs

- **WHEN** a change has no `specs/` folder
- **THEN** the system exposes an empty list of specs

