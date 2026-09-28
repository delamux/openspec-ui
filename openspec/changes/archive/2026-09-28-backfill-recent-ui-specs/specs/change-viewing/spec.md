## ADDED Requirements

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

## MODIFIED Requirements

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
