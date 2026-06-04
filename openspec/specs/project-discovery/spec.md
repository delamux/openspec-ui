# project-discovery Specification

## Purpose
TBD - created by archiving change discover-openspec-projects. Update Purpose after archive.
## Requirements
### Requirement: Discover OpenSpec projects under the root

The system SHALL scan the direct child directories of the configured projects root and identify those that are OpenSpec-enabled. A directory is OpenSpec-enabled when it contains an `openspec/config.yaml` file.

#### Scenario: Root contains OpenSpec projects

- **WHEN** the configured root has child directories, some of which contain `openspec/config.yaml`
- **THEN** the system returns one project per OpenSpec-enabled child directory

#### Scenario: Child directories without OpenSpec are ignored

- **WHEN** a child directory has no `openspec/config.yaml`
- **THEN** that directory is excluded from the discovered projects

#### Scenario: Discovery is shallow

- **WHEN** an OpenSpec-enabled project is nested deeper than a direct child of the root (e.g. a grandchild directory)
- **THEN** it is NOT discovered (only direct children are scanned)

#### Scenario: Non-directory entries are ignored

- **WHEN** the root contains files alongside directories
- **THEN** files are excluded and only directories are considered

### Requirement: Each discovered project exposes a name and path

The system SHALL represent each discovered project with a human-readable name and its absolute path. The name SHALL default to the project directory's own name.

#### Scenario: Project name and path

- **WHEN** a project is discovered at `<root>/my-app`
- **THEN** the project's name is `my-app` and its path is the absolute path to `<root>/my-app`

### Requirement: Handle empty and unconfigured discovery states

The system SHALL distinguish the cases where no root is configured, where the root has no OpenSpec projects, and where discovery succeeds, so the UI can render each appropriately.

#### Scenario: No root configured

- **WHEN** discovery is requested but no projects root is configured
- **THEN** the system reports the "no root configured" state rather than an error or an empty list

#### Scenario: Root configured but contains no OpenSpec projects

- **WHEN** the configured root exists but no child directory is OpenSpec-enabled
- **THEN** the system returns an empty list of projects (a successful, empty result)

#### Scenario: Configured root no longer exists

- **WHEN** the configured root path no longer exists on disk at discovery time
- **THEN** the system reports a discovery error identifying the missing root

