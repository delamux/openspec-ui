## Context

openspec-ui discovers projects under `PROJECTS_PATH` and lets you read/edit a project's `main` OpenSpec change. The building of a change, though, happens on a branch — often in a git worktree driven by a Claude Code agent. The companion tool `worktree-dashboard` (vanilla Node `http` + shell scripts + SSE) does exactly this for a *single* repo. This change brings that capability inside openspec-ui, which already supplies the multi-project shell `worktree-dashboard` lacks.

The unlocking observation: **a worktree is just another OpenSpec root.** `LoadChange(path, changeName)` joins `<path>/openspec/changes/<name>/…` for any `path`. So reading a worktree's live change costs nothing new — we point the existing loader at the worktree directory. What's genuinely new is: the git worktree operations, the live agent status from Claude's session logs, and a two-tab layout.

We reuse `worktree-dashboard`'s **git recipes** (the exact commands it has debugged), not its code — its architecture (monolithic `server.mjs`, bash scripts, SSE) would fight openspec-ui's hexagonal/Astro-Actions model.

## Goals / Non-Goals

**Goals:**
- A `worktree-management` vertical slice: list / create-for-change / remove git worktrees behind a `WorktreeRepository` port.
- Live agent status per worktree behind an `AgentActivityProvider` port, read from `~/.claude/projects/*.jsonl`, polled on a short interval.
- A two-tab layout under the shared project picker: **Changes** (existing, on the project's `main`) and **Worktrees** (new).
- Reuse `change-viewer` unchanged to render/edit a worktree's *own* change copy, so review feedback lands where the agent re-reads it.

**Non-Goals:**
- SSE / push updates (v1 polls).
- Prompt-logging hooks (`worktree-dashboard init`: `.claude/hooks` needing `jq` + `claude`).
- Per-worktree dev servers (spawn/stop long-lived processes, port assignment).
- Open-in-editor / auto-launch Claude (`CLAUDE_TASK.md` + `.vscode/tasks.json` + `code`).
- Creating a *new* change from the worktree flow (branch only for changes that already exist).

## Decisions

### 1. New slice `worktree-management`, first external-process adapter
Layers as usual: domain (`Worktree`, `BranchName`, `WorktreeName`, `AgentStatus`, ports + InMemory impls), application (use cases + DTOs), infrastructure (`git/`, `session/`, `ui/`). The `WorktreeRepository` port is implemented by `GitWorktreeRepository`, which shells `git` via `node:child_process`. **Why:** every prior adapter reads/writes files; git is an external process, but it's still a driven port — domain/application stay free of `child_process`, exactly as they're free of `node:fs` today.

### 2. Git recipes (lifted from worktree-dashboard, re-homed in the adapter)
- list: `git worktree list --porcelain`, parse `worktree`/`branch`/`bare`/`detached` blocks; index 0 is the main checkout.
- create: if `git show-ref --verify --quiet refs/heads/<branch>` → `git worktree add <path> <branch>`, else `git worktree add -b <branch> <path>`.
- remove: `git worktree remove --force <path>` (guard: never the main checkout).
- Commands run with `cwd = projectPath`; arguments are passed as an argv array (no shell string interpolation).

### 3. Worktree placement & branch convention
A worktree for change `<name>` lives at `<project>/.claude/worktrees/<name>` on branch `change/<name>`. The listing filters `git worktree list` to worktrees under `<project>/.claude/worktrees/` (plus the main checkout). **Why:** matches `worktree-dashboard`'s default layout and keeps a project's worktrees self-contained and gitignore-friendly.

### 4. Names are validating value objects, not regex-at-the-callsite
`WorktreeName` and `BranchName` factory methods accept only `[A-Za-z0-9._/-]` and reject traversal/space/shell metacharacters, throwing `DomainError.createValidation()`. **Why:** worktree-dashboard sanitizes inline; modeling it as a VO makes the safety a domain invariant and keeps unsafe values from ever reaching the git argv. Combined with argv-array execution (Decision 2), command injection is structurally prevented.

### 5. A worktree is just another OpenSpec root — reuse `change-viewer`
To show a worktree's progress and to review it, the worktree slice hands the worktree's path to the existing `LoadChange` / `ToggleTask` / `AddComment`. **Why:** zero parser/serializer changes; the live copy under `<worktree>/openspec/changes/<name>` is read and written by code already tested. The **source-of-truth rule:** the Changes tab operates on the project's `main` copy; the Worktrees tab operates on the worktree's copy. Writes in the Worktrees view therefore reach the agent working in that worktree.

### 6. Live status = `AgentActivityProvider` reading `~/.claude/projects/`
`ClaudeSessionActivityProvider` maps a worktree's absolute path to its session directory using Claude's encoding (absolute path with separators replaced by `-`, e.g. `~/.claude/projects/-home-user-code-app--claude-worktrees-add-auth/`), reads the most recent `*.jsonl`, and derives `AgentStatus` (working/thinking/waiting/done/idle/no-session) plus last tool/file/message, token count, and relative last-activity. Parsing is tolerant: malformed/partial lines are skipped. **Why:** this is the same source `worktree-dashboard` uses; it's read-only and safe to poll.

### 7. Live = polling Actions, not SSE
A new `worktreeActivity` Action returns the status for a project's worktrees; the `WorktreePanel` island re-calls it on a ~3s `setInterval` (cleared on unmount), folding results into its single `useState`. **Why:** openspec-ui has no streaming today and islands are request/response; `worktree-dashboard` itself rebuilds its data on a 3s timer, so polling gives identical freshness with zero new infrastructure. SSE is a clean later upgrade if 3s ever feels laggy.

### 8. UI: a tab shell + a `WorktreePanel` island
The page keeps the shared project `<Select>`; beneath it, a `Tabs` (reusing the existing `Tabs` primitive) switches between the current change browser and the new `WorktreePanel`. `WorktreePanel` lists worktree cards (branch, main flag, `AgentStatus` dot, task progress bar from `LoadChange` on the worktree path, last tool/file), a "New worktree for change" dialog (a `<Select>` of the project's active changes), and a Remove control (guarded for main). Selection is reflected in the URL (`?project=…&tab=worktrees&worktree=…`). **Why:** reuses existing primitives and the URL-state pattern from the change browser.

### 9. Actions and Factory wiring
New Actions: `listWorktrees(projectPath)`, `createWorktreeForChange(projectPath, changeName)`, `removeWorktree(projectPath, worktreePath)`, `worktreeActivity(projectPath)`. Each is a thin handler delegating to one use case, mapping `DomainError` to the existing result-DTO shape (`kind: 'ok' | 'error' | 'stale'`); `createWorktreeForChange` maps an already-exists conflict to `stale`/conflict. `Factory.fromEnv()` builds `GitWorktreeRepository` + `ClaudeSessionActivityProvider` and exposes the new use cases; `withDependencies` keeps the InMemory test variant.

## Risks / Trade-offs

- **git output variance** (versions, bare repos, locked worktrees) → parse `--porcelain` defensively; unknown blocks are skipped, never throw; surface git stderr as a domain error.
- **Session-log format drift** (Claude Code changes its JSONL) → keep the parser tolerant and status-mapping small; treat unknown shapes as `idle`/`no-session` rather than failing.
- **Polling cost** (re-reading git + JSONL every 3s per project) → cheap for a handful of worktrees; revisit interval or move to SSE if a project has many.
- **Two diverging copies** (main vs worktree `tasks.md`) is *intended*, but could confuse → the UI must clearly label which copy a view edits (Changes = main, Worktrees = the worktree).
- **Encoded-path mapping** is a Claude Code convention, not a contract → isolate it in one function with focused tests; if it ever changes, only that adapter moves.
- **`.claude/worktrees` is gitignored in many repos** → worktrees there won't pollute git status; listing relies on `git worktree list` (the registry), not a directory scan, so gitignore doesn't hide them.

## Migration Plan

Greenfield feature, additive. Deploy = `pnpm dev` with `PROJECTS_PATH` set; open `/`, pick a project, open the Worktrees tab. Requires `git` on PATH (already a project requirement). Rollback = revert the branch; the only persisted side effects are git worktrees the user explicitly created (removable from the UI or `git worktree remove`). Existing slices are untouched.

## Open Questions

- **Branch prefix** — fixed `change/<name>`, or configurable per project (some teams use `feature/`/`wt/`)? Leaning fixed for v1.
- **Worktree → change association** — derive the change from the branch name (`change/<name>` → `<name>`), or also match when the branch differs but a single active change is in progress? Leaning: derive from the branch for v1.
- **Show the main checkout as a card** in the Worktrees tab, or only the `.claude/worktrees/*` worktrees? Leaning: show it (read-only, no Remove) so its status is visible too.
- **Polling cadence** — fixed 3s, or pause polling when the tab/window is hidden? Leaning: pause on `document.hidden` to avoid needless reads.
