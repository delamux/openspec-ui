# worktree-listing Specification

## Purpose
TBD - created by archiving change add-worktree-management. Update Purpose after archive.
## Requirements
### Requirement: List a project's worktrees

The system SHALL list the git worktrees of a selected project by enumerating the project's registered worktrees and presenting those located under the project's `.claude/worktrees/` directory, plus the main checkout. The main checkout SHALL be identified distinctly.

#### Scenario: Project has worktrees under .claude/worktrees

- **WHEN** a project has worktrees registered at `<project>/.claude/worktrees/add-auth` and `<project>/.claude/worktrees/fix-parser`
- **THEN** the system returns both worktrees, each with its path and branch

#### Scenario: The main checkout is flagged

- **WHEN** the project's worktrees are listed
- **THEN** the main checkout is included and flagged as the main worktree (distinct from the others)

#### Scenario: A project with no extra worktrees

- **WHEN** a project has only its main checkout and no worktrees under `.claude/worktrees/`
- **THEN** the system returns a successful result containing just the main checkout (not an error)

### Requirement: Each worktree exposes path, branch, and main flag

The system SHALL represent each worktree with its directory path, its checked-out branch (or a detached-HEAD indicator), and whether it is the main checkout.

#### Scenario: Worktree on a named branch

- **WHEN** a worktree at `.claude/worktrees/add-auth` has `change/add-auth` checked out
- **THEN** its branch is reported as `change/add-auth` and its main flag is false

#### Scenario: Worktree with a detached HEAD

- **WHEN** a worktree has a detached HEAD
- **THEN** it is reported with a detached-HEAD indicator rather than a branch name

### Requirement: Each worktree exposes its in-progress change progress

The system SHALL, for a listed worktree, expose the task progress of the OpenSpec change being worked on in that worktree by reading the change from the worktree's own OpenSpec root (`<worktree>/openspec/changes/<name>`), so the progress reflects the live copy the agent is editing rather than the main checkout's copy.

#### Scenario: Worktree branched for a change shows live progress

- **WHEN** a worktree on branch `change/add-auth` has `<worktree>/openspec/changes/add-auth/tasks.md` with 6 of 10 tasks done
- **THEN** the worktree's progress is reported as 6 of 10, read from the worktree's copy

#### Scenario: Worktree's change copy diverges from main

- **WHEN** the worktree's `tasks.md` marks a task done that is still open in the project's `main` copy
- **THEN** the worktree listing reflects the worktree's copy, not the main copy

#### Scenario: Worktree has no matching change

- **WHEN** a worktree has no OpenSpec change directory matching its branch
- **THEN** the worktree is still listed, with no change progress (not an error)

### Requirement: Listing tolerates a non-git or unreadable project

The system SHALL distinguish "no worktrees" from an error, and SHALL surface a domain error (without leaking internal details) when the project directory is not a git repository or cannot be read.

#### Scenario: Project is not a git repository

- **WHEN** the selected project directory is not a git repository
- **THEN** the system returns a domain error describing the problem, not a stack trace
