## ADDED Requirements

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
