## ADDED Requirements

### Requirement: Toggle a task's done state

The system SHALL toggle a task between done and not-done by flipping its checkbox in the change's `tasks.md` (`- [ ]` ⇄ `- [x]`), changing only that task's line.

#### Scenario: Check an open task

- **WHEN** the user checks a task that is `- [ ]`
- **THEN** that line becomes `- [x]` in `tasks.md` and no other line changes

#### Scenario: Uncheck a done task

- **WHEN** the user unchecks a task that is `- [x]`
- **THEN** that line becomes `- [ ]` in `tasks.md` and no other line changes

### Requirement: Edit a task's text

The system SHALL let the user change a task's text, replacing only the text that follows the task id and preserving the checkbox state, id, and indentation.

#### Scenario: Edit and save

- **WHEN** the user edits a task's text and confirms a non-empty value
- **THEN** that task's text is updated in `tasks.md`, its done state and id unchanged

#### Scenario: Reject empty text

- **WHEN** the user clears a task's text and tries to save
- **THEN** the edit is rejected and `tasks.md` is unchanged

### Requirement: Delete a task

The system SHALL delete a task, removing its line and any `<!-- ui:comment … -->` block attached beneath it, leaving the rest of the file intact.

#### Scenario: Delete a task with comments

- **WHEN** the user deletes a task that has an inline comment block
- **THEN** the task line and its comment block are removed from `tasks.md` and surrounding tasks are untouched

#### Scenario: Delete is confirmed

- **WHEN** the user triggers delete
- **THEN** the system requires a confirmation before writing the file

### Requirement: Add a task to a chosen group

The system SHALL let the user add a new not-done task to a specific task group (each `## N. Title` section has its own add control), appending it within that group with an id auto-derived from the group's number and the next available sub-index.

#### Scenario: Add to the chosen group

- **WHEN** the user adds a task to the group `## 2. Build` (which has tasks `2.1`–`2.2`)
- **THEN** a line `- [ ] 2.3 <text>` is appended inside that section in `tasks.md`, before the next section heading

#### Scenario: Auto-number avoids collisions after a delete

- **WHEN** a group has tasks `1.1` and `1.3` (after `1.2` was deleted) and the user adds a task
- **THEN** the new task's id is `1.4` (the max existing sub-index plus one), never a duplicate

#### Scenario: Ignore empty input

- **WHEN** the user submits blank task text
- **THEN** no task is added and `tasks.md` is unchanged

### Requirement: Preserve untouched content (round-trip fidelity)

The system SHALL apply every task edit as a surgical change to the raw `tasks.md` text, leaving every line not targeted by the edit byte-identical (headings, blank lines, prose, markdown formatting, and other tasks).

#### Scenario: Only the targeted line changes

- **WHEN** any single task is toggled, edited, or deleted
- **THEN** every other line in `tasks.md` is identical to before the operation

### Requirement: Guard against a stale edit

The system SHALL locate the target task by its id together with its expected current text; if the on-disk task text no longer matches what the UI last loaded, the edit SHALL be rejected rather than overwrite divergent content.

#### Scenario: On-disk text drifted since load

- **WHEN** an edit targets a task whose text on disk differs from the text the UI sent
- **THEN** the system rejects the edit and reports that the change should be reloaded

### Requirement: Reflect the file after a write

The system SHALL re-read the change from disk after a successful edit so the UI shows the persisted state.

#### Scenario: UI updates after an edit

- **WHEN** an edit succeeds
- **THEN** the Tasks tab reflects the re-read `tasks.md` (updated state, text, or task list)
