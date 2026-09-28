# change-listing Specification

## Purpose
TBD - created by archiving change view-project-changes. Update Purpose after archive.
## Requirements
### Requirement: List the changes in a project

The system SHALL list the OpenSpec changes inside a selected project by scanning `openspec/changes/` for active changes and `openspec/changes/archive/` for archived changes. A directory is a change when it contains a change artifact (at minimum a `proposal.md`).

#### Scenario: Project has active and archived changes

- **WHEN** a project's `openspec/changes/` has change directories and `openspec/changes/archive/` has archived ones
- **THEN** the system returns every active and archived change

#### Scenario: Archived changes are marked as archived

- **WHEN** a change is found under `openspec/changes/archive/`
- **THEN** it is included and flagged as archived (distinct from active changes)

#### Scenario: Archived changes are ordered by archive date

- **WHEN** a project has archived changes `2026-06-05-view`, `2026-06-04-first`, `2026-09-03-mobile` and `2026-06-05-align`
- **THEN** they are listed newest archive date first, changes archived the same day by name, and any archived change without a date prefix last: `2026-09-03-mobile`, `2026-06-05-align`, `2026-06-05-view`, `2026-06-04-first`

#### Scenario: Non-change directories are ignored

- **WHEN** a directory under `openspec/changes/` has no `proposal.md`
- **THEN** it is excluded from the list

### Requirement: Each listed change exposes a name and status

The system SHALL represent each change with its name and a status. The name SHALL default to the change directory name; archived changes retain their archived directory name.

#### Scenario: Change name and status

- **WHEN** an active change directory `add-auth` is listed
- **THEN** its name is `add-auth` and it is reported as active

### Requirement: Handle a project with no changes

The system SHALL distinguish a project that has no changes from an error, so the UI can show an empty state.

#### Scenario: Project without any changes

- **WHEN** a selected project has neither active nor archived changes
- **THEN** the system returns an empty list (a successful, empty result), not an error

### Requirement: Group the change picker by where a change lives

The change picker SHALL group changes by where they live, in this order: a group named after the project with its active changes, one group per non-main worktree labeled `WT <worktree>`, and an `Archived` group. Only groups that have changes SHALL be shown. A worktree is a full checkout of the project, so its group SHALL list only the change the worktree was created for (its live copy) and changes that exist only in that worktree, never its copies of the project's other changes or its archived changes. Project changes and worktree groups SHALL be ordered by name. Within a worktree group, the worktree's own change SHALL come first and the rest SHALL follow by name. Archived changes SHALL keep the listing order (newest archive date first) and SHALL be hidden until "Show archived" is on. The change currently being viewed is the exception and stays listed.

#### Scenario: A worktree does not repeat the project's changes

- **WHEN** project `/p` has changes `add-auth` and `dispatch-booking-create`, and worktree `add-auth` (branch `change/add-auth`) contains copies of both plus `new-idea`
- **THEN** the picker shows the project group with `add-auth` and `dispatch-booking-create`, then `WT add-auth` with `add-auth` followed by `new-idea`

#### Scenario: Groups and options are ordered by name

- **WHEN** the project has `zebra` and `add-auth` and there are worktrees `wt-b` and `wt-a`
- **THEN** the project group lists `add-auth` before `zebra`, and `WT wt-a` comes before `WT wt-b`

#### Scenario: Archived changes come last in listing order

- **WHEN** "Show archived" is on and the listing returns `2026-06-05-newer` before `2026-06-04-older`
- **THEN** the `Archived` group follows every worktree group and keeps that order

