## ADDED Requirements

### Requirement: Read the projects root from the environment

The system SHALL read the single projects-root folder path from the `PROJECTS_PATH` environment variable (provided via a `.env` file in the project root). The projects root is operator configuration and is read-only at runtime — there is no in-app mechanism to set or persist it.

#### Scenario: Configured with an absolute path

- **WHEN** `PROJECTS_PATH` is set to an absolute directory path
- **THEN** the system uses that path as the projects root for discovery

#### Scenario: Surrounding whitespace is ignored

- **WHEN** `PROJECTS_PATH` is set with leading or trailing whitespace
- **THEN** the system trims it before using the value

### Requirement: Distinguish an unset projects root

The system SHALL treat an unset or empty `PROJECTS_PATH` as "not configured" — an absent value, not an error — so the UI can prompt the operator to configure it.

#### Scenario: Variable unset

- **WHEN** `PROJECTS_PATH` is not defined
- **THEN** the system reports that no projects root is configured

#### Scenario: Variable empty

- **WHEN** `PROJECTS_PATH` is defined but empty or only whitespace
- **THEN** the system reports that no projects root is configured

### Requirement: Reject a misconfigured projects root

The system SHALL reject a `PROJECTS_PATH` that is set but not an absolute path, surfacing it as a configuration error rather than silently ignoring it.

#### Scenario: Non-absolute path configured

- **WHEN** `PROJECTS_PATH` is set to a relative path
- **THEN** discovery reports a configuration error identifying the invalid value
