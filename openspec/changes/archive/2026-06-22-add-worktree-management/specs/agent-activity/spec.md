## ADDED Requirements

### Requirement: Expose the live agent status of a worktree

The system SHALL expose the current status of the Claude Code agent working in a given worktree, derived from that worktree's session logs under `~/.claude/projects/`. The status SHALL be one of: working, thinking, waiting, done, idle, or no-session.

#### Scenario: Active agent in a worktree

- **WHEN** a worktree has a recent session whose latest entry shows the agent mid-turn
- **THEN** the worktree's status is reported as working (or thinking/waiting per the latest entry)

#### Scenario: Finished agent

- **WHEN** the latest session entry for a worktree indicates the turn completed
- **THEN** the worktree's status is reported as done

#### Scenario: No session for a worktree

- **WHEN** no session log directory exists for the worktree's path
- **THEN** the worktree's status is reported as no-session (a successful result, not an error)

### Requirement: Locate a worktree's session log directory from its path

The system SHALL map a worktree's absolute path to its Claude Code session directory under `~/.claude/projects/`, using the path-encoding convention Claude Code uses (the absolute path with separators replaced), and SHALL select the most recent session log when several exist.

#### Scenario: Map worktree path to its session directory

- **WHEN** a worktree is at `/home/user/code/app/.claude/worktrees/add-auth`
- **THEN** the system reads its session logs from the corresponding `~/.claude/projects/<encoded-path>/` directory

#### Scenario: Most recent session is used

- **WHEN** a worktree's session directory contains multiple `*.jsonl` logs
- **THEN** the system derives status from the most recently modified one

### Requirement: Surface recent activity details

The system SHALL, when a session exists, expose recent activity details for display: the last tool used, the last file touched (with optional line), the last assistant message, the output token count, and a relative "last activity" time.

#### Scenario: Activity details available

- **WHEN** a worktree's latest session entries include a tool use against a file
- **THEN** the system exposes the last tool, the last file (and line if present), and the relative time of the last activity

#### Scenario: Missing details degrade gracefully

- **WHEN** a session exists but a given detail (e.g. last file) is absent
- **THEN** that detail is reported as absent rather than causing an error

### Requirement: Activity reads are safe to poll

The system SHALL make agent-activity reads side-effect free and tolerant of partially written or malformed log lines, so the UI can poll them on a short interval without errors.

#### Scenario: Malformed log line is skipped

- **WHEN** a session log contains a malformed or partially written JSON line
- **THEN** the system skips that line and still reports a status from the valid entries

#### Scenario: Repeated polling is consistent

- **WHEN** the activity for a worktree is read repeatedly with no change in the logs
- **THEN** each read returns the same status without modifying any file
