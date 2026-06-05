## ADDED Requirements

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

The system SHALL present a loaded change in a three-tab interface — Proposal, Design, Tasks — with a system-following light/dark theme. In this read-only slice the task checkboxes and comment composers are shown but non-interactive.

#### Scenario: Switching tabs

- **WHEN** the user selects the Proposal, Design, or Tasks tab
- **THEN** the corresponding rendered content is shown without reloading the change

#### Scenario: Read-only interactions

- **WHEN** the Tasks tab is shown
- **THEN** checkboxes reflect the parsed done state and existing comments are visible, but neither can be changed (write-back is a later capability)
