## ADDED Requirements

### Requirement: Create a worktree for an existing change

The system SHALL create a git worktree for an existing OpenSpec change in the selected project. The worktree SHALL be placed at `<project>/.claude/worktrees/<change-name>` and SHALL check out a branch named `change/<change-name>`. If that branch does not exist it SHALL be created from the current HEAD; if it already exists it SHALL be attached.

#### Scenario: Create a worktree for a change with a new branch

- **WHEN** the user creates a worktree for the active change `add-auth` and no `change/add-auth` branch exists
- **THEN** the system creates the branch `change/add-auth` and adds a worktree at `<project>/.claude/worktrees/add-auth` checked out to it

#### Scenario: Create a worktree attaching an existing branch

- **WHEN** the user creates a worktree for `add-auth` and the branch `change/add-auth` already exists
- **THEN** the system adds a worktree checked out to the existing branch without creating a new one

#### Scenario: Worktree already exists for the change

- **WHEN** a worktree already exists at `<project>/.claude/worktrees/add-auth`
- **THEN** the system reports the conflict and does not overwrite the existing worktree

#### Scenario: Change does not exist in the project

- **WHEN** the user requests a worktree for a change name that has no directory under `<project>/openspec/changes/`
- **THEN** the system returns a domain error and creates no worktree

### Requirement: Validate branch and worktree names

The system SHALL validate the change name used to derive the branch and directory, accepting only characters safe for a path and a git ref (letters, digits, `.`, `_`, `-`, `/`), and SHALL reject anything else so that no unsafe value reaches the git command line.

#### Scenario: Reject an unsafe change name

- **WHEN** a change name contains a character outside the allowed set (e.g. a space, `;`, or `..` traversal)
- **THEN** the system rejects it with a validation error and runs no git command

#### Scenario: Accept a conventional change name

- **WHEN** the change name is `add-auth`
- **THEN** the derived branch `change/add-auth` and directory `add-auth` are accepted

### Requirement: Remove a worktree

The system SHALL remove a selected worktree from the project, refusing to remove the main checkout.

#### Scenario: Remove a non-main worktree

- **WHEN** the user removes the worktree at `<project>/.claude/worktrees/fix-parser`
- **THEN** the system removes that worktree and it no longer appears in the listing

#### Scenario: Refuse to remove the main checkout

- **WHEN** the user attempts to remove the main checkout
- **THEN** the system refuses with a domain error and removes nothing

#### Scenario: Removing an unknown worktree

- **WHEN** the user removes a worktree path that is not a registered worktree of the project
- **THEN** the system returns a domain error and removes nothing
