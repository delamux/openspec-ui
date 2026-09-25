## ADDED Requirements

### Requirement: List a project's documents by section

The system SHALL list the markdown documents of a selected project and its `openspec/config.yaml`, grouped into the sections Config, Agents & skills, Specs and Docs. Agents & skills SHALL hold documents under `.claude/`, `.agents/`, `agents/` or `.github/` and any `CLAUDE.md` or `AGENTS.md`. Specs SHALL hold documents under `openspec/specs/`. Docs SHALL hold every other document, with README files first. The listing SHALL NOT include `openspec/changes/**`, dependency or build folders, `.git`, or entries reached through a symbolic link.

#### Scenario: A project with config, skills, specs and docs

- **WHEN** the project contains `openspec/config.yaml`, `.claude/skills/tdd/SKILL.md`, `CLAUDE.md`, `openspec/specs/auth/spec.md`, `README.md` and `docs/guide.md`
- **THEN** Config lists `openspec/config.yaml`; Agents & skills lists `.claude/skills/tdd/SKILL.md` and `CLAUDE.md`; Specs lists `openspec/specs/auth/spec.md`; Docs lists `README.md` then `docs/guide.md`

#### Scenario: Ignored folders

- **WHEN** the project contains `node_modules/pkg/README.md`, `.git/info.md` and `openspec/changes/add-auth/proposal.md`
- **THEN** none of those files are listed

### Requirement: Read one project document safely

The system SHALL return the content of a listed document given its path relative to the project. It SHALL reject a path that is absolute, contains `.` or `..` segments, or is not a markdown file or `openspec/config.yaml`, and SHALL refuse a file whose real location is outside the project folder.

#### Scenario: Reading a skill

- **WHEN** the user opens `.claude/skills/tdd/SKILL.md`
- **THEN** its content is returned unchanged

#### Scenario: Path traversal

- **WHEN** a client asks for `../other-project/README.md` or `/etc/passwd`
- **THEN** the request fails with a validation error and no file is read

#### Scenario: Missing document

- **WHEN** a client asks for `docs/missing.md` and no such file exists
- **THEN** the request fails with a not-found error

### Requirement: Browse documents in a Project information tab

Once a project is selected, the system SHALL offer a "Project information" workspace tab with a sidebar showing each non-empty section as a folder tree and a viewer showing the selected document. Markdown SHALL be rendered, YAML front matter SHALL be shown as a highlighted YAML block above the body, and `config.yaml` SHALL be shown as a highlighted YAML block. The tab SHALL open on `openspec/config.yaml`, or on the root README when there is no config. The tab is read-only.

#### Scenario: Opening the Project information tab

- **WHEN** the user selects a project that has `openspec/config.yaml` and opens the Project information tab
- **THEN** the sidebar shows the sections and the viewer shows the config as highlighted YAML

#### Scenario: Viewing a skill with front matter

- **WHEN** the user clicks `.claude/skills/tdd/SKILL.md` whose file starts with `---\nname: tdd\n---`
- **THEN** the viewer shows `name: tdd` as a YAML block followed by the rendered markdown body
