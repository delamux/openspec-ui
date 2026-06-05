## ADDED Requirements

### Requirement: List the changes in a project

The system SHALL list the OpenSpec changes inside a selected project by scanning `openspec/changes/` for active changes and `openspec/changes/archive/` for archived changes. A directory is a change when it contains a change artifact (at minimum a `proposal.md`).

#### Scenario: Project has active and archived changes

- **WHEN** a project's `openspec/changes/` has change directories and `openspec/changes/archive/` has archived ones
- **THEN** the system returns every active and archived change

#### Scenario: Archived changes are marked as archived

- **WHEN** a change is found under `openspec/changes/archive/`
- **THEN** it is included and flagged as archived (distinct from active changes)

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
