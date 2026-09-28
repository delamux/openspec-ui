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

The system SHALL present a loaded change in a four-tab interface — Proposal, Specs, Design, Tasks — with a system-following light/dark theme. The Specs tab SHALL render one delta spec at a time; when the change has more than one, a capability picker SHALL select which one is shown. The Tasks tab is interactive: task checkboxes, inline text editing, delete, add, and drag-to-reorder act on the change's `tasks.md` (see the `task-editing` capability). Existing comments remain read-only. The active tab SHALL be kept in the query string as `tab` so it survives a refresh and a change of selected change.

#### Scenario: Switching tabs

- **WHEN** the user selects the Proposal, Specs, Design, or Tasks tab
- **THEN** the corresponding rendered content is shown without reloading the change

#### Scenario: The active tab survives a refresh

- **WHEN** the user opens the Tasks tab of a change and refreshes the page
- **THEN** the URL carries `tab=tasks` next to `project` and `change`, and the reloaded page opens that change on the Tasks tab; the default Proposal tab is left out of the URL, and an unknown `tab` value falls back to Proposal

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

### Requirement: Highlight fenced code blocks

The markdown renderer SHALL wrap every fenced code block in a code block container. When the fence names a known language (bash, css, diff, javascript, json, markdown, python, sql, typescript, xml or yaml, including their common aliases such as `ts`), the renderer SHALL syntax-highlight it and record the language on the container. When the fence names no language or an unknown one, the renderer SHALL render the code as HTML-escaped plain text. Inline markdown formatting SHALL NOT be applied inside a fence, and raw HTML in a fence SHALL never be emitted unescaped.

#### Scenario: A labeled fence is highlighted

- **WHEN** a document contains a fence opened with ```` ```ts ```` holding `const x = 1;`
- **THEN** the block is rendered inside a code block container marked with language `ts`, with `const` highlighted as a keyword

#### Scenario: An unlabeled or unknown fence is escaped

- **WHEN** a fence has no language, or the language `not-a-language`, and holds `<script>alert(1)</script>`
- **THEN** the block shows the text `<script>alert(1)</script>` escaped, and no script element is produced

#### Scenario: No inline formatting inside a fence

- **WHEN** a fence holds `const **x** = 1;`
- **THEN** the asterisks are shown literally and no bold markup is produced

### Requirement: Keep the selection in the URL

The system SHALL write the selected project, change and worktree to the page's query string as `project`, `change` and `worktree`. It SHALL include only the parameters that are set, and it SHALL replace the current history entry instead of adding a new one. On load, the system SHALL restore the selection from those parameters. With no `worktree`, `change` SHALL match the project's own copy of the change. With a `worktree`, it SHALL match that worktree's copy. A `change`/`worktree` pair that matches nothing SHALL select no change.

#### Scenario: A worktree change survives a refresh

- **WHEN** the user selects change `add-auth` from worktree `wt-a` of project `/p` and refreshes the page
- **THEN** the URL is `?project=%2Fp&change=add-auth&worktree=wt-a`, and the reloaded page shows the worktree's copy of `add-auth`, not the project's

#### Scenario: A main change leaves the worktree out

- **WHEN** the user selects the project's own change `add-auth`
- **THEN** the URL carries `project` and `change` only

#### Scenario: The named worktree copy is gone

- **WHEN** the URL names worktree `wt-a` but that worktree has no `add-auth`
- **THEN** no change is selected

