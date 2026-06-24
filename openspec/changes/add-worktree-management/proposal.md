## Why

Today openspec-ui lets you pick a project and read/edit the change you planned on `main`. But the actual *building* of a change happens on a branch — increasingly in a git **worktree** driven by a Claude Code agent. Right now that work is invisible here: you plan in openspec-ui, then leave it to spin up a worktree, run the agent, and watch progress elsewhere (the `worktree-dashboard` tool exists precisely for that).

This change folds the worktree workflow into the dashboard you already have. The insight that makes it cheap: **a worktree is just another OpenSpec root.** `LoadChange(path, changeName)` already reads `<path>/openspec/changes/<name>/…` for any `path`; point it at a worktree and it reads that worktree's live `tasks.md` — the copy the agent is actually ticking. So the read/parse path is reused as-is; we add the git operations, the live agent status, and a second tab.

It also completes the review-feedback loop the tool was built for: watch the agent's live task progress in a worktree, drop a comment on a half-done task, and the agent running *in that worktree* picks it up — because the comment is written into the worktree's openspec.

## What Changes

- **Tabs after selecting a project.** The project picker stays shared; below it, two tabs: **Changes** (today's read/edit of the project's `main` openspec) and **Worktrees** (new).
- **List a project's worktrees.** The Worktrees tab lists git worktrees under `<project>/.claude/worktrees/`, each showing its branch, whether it's the main checkout, and its in-progress change's task progress (reusing the existing change-viewer against the worktree path).
- **Create a worktree for an existing change.** Pick one of the project's active changes → create a worktree branched for it: branch `change/<name>`, directory `<project>/.claude/worktrees/<name>`, via `git worktree add -b change/<name> <path>` (or attach to the branch if it already exists).
- **Remove a worktree.** Remove a non-main worktree via `git worktree remove --force`, with a guard that refuses to remove the main checkout.
- **Live agent status (polling).** Each worktree card shows the live status of the Claude agent working there — working / thinking / waiting / done / idle, plus last tool, last file, and token count — parsed from Claude Code's session logs under `~/.claude/projects/`. The island re-polls a status Action on a short interval (~3s).
- **Review the live copy.** In the Worktrees tab, viewing a worktree's change reads and writes the **worktree's** `openspec/changes/<name>/tasks.md` — so toggles and comments land where the agent (running in that worktree) will re-read them.
- **Bootstrap the agent task (Option A).** On create, the new worktree is *prepared* for an agent: the project's `.claude/skills` + `.claude/agents` are copied in (so `/openspec-apply-change` exists there), and a `CLAUDE_TASK.md` (an apply-change prompt naming the change) + a `.vscode/tasks.json` (folderOpen → `claude`) are written. An **"Open in VS Code"** button on each card shells `code <path>` — opening it kicks off Claude on that task. The app prepares and opens; it does not run the agent headlessly itself.

Non-goals (future changes):
- **SSE / true push** — v1 polls; a streaming endpoint is a later upgrade.
- **Prompt-logging hooks** — the `worktree-dashboard init` flow (installing `.claude/hooks` that need `jq` + the `claude` CLI to produce a one-line "what was it asked" summary).
- **Per-worktree dev servers** — spawning/stopping long-lived `npm run` processes with port assignment.
- **Headless auto-launch of the agent (Option B)** — spawning `claude` unattended from the server on create. We prepare + open (Option A); fully automatic, money-spending launch is deferred.
- Creating a *new* OpenSpec change from the worktree flow (use `openspec-propose` first); this change branches for changes that already exist.

## Capabilities

### New Capabilities
- `worktree-listing`: list a project's git worktrees (under `.claude/worktrees/`), each exposing its path, branch, main-checkout flag, and the task progress of the in-progress change in that worktree.
- `worktree-creation`: create a worktree branched for an existing change (`change/<name>` → `.claude/worktrees/<name>`) and remove a non-main worktree, with branch/name validation and a main-checkout guard.
- `agent-activity`: expose the live status of the Claude Code agent working in a worktree — derived from the worktree's session logs under `~/.claude/projects/` — without throwing when no session exists.

### Modified Capabilities
<!-- None at the spec level. `change-viewing` is reused unchanged: it already loads a change from any path, so pointing it at a worktree path is a wiring detail, not a requirement change. The two-tab layout is a UI rendering detail. -->

## Impact

- **New module:** `src/modules/worktree-management/` (domain, application, infrastructure/{git,session,ui}).
- **New ports/adapters:**
  - `WorktreeRepository` (domain port) → `GitWorktreeRepository` (`infrastructure/git/`) shelling `git worktree list --porcelain` / `git worktree add [-b] …` / `git worktree remove --force …` via `node:child_process`. This is the project's first *external-process* driven adapter (vs. the existing filesystem adapters).
  - `AgentActivityProvider` (domain port) → `ClaudeSessionActivityProvider` (`infrastructure/session/`) reading `~/.claude/projects/<encoded-worktree-path>/*.jsonl`.
- **New value objects:** `Worktree` (path, branch, isMain, head), `BranchName` and `WorktreeName` (validate/sanitize to `[A-Za-z0-9._/-]` in factory methods — replacing worktree-dashboard's inline regex), `AgentStatus`.
- **New use cases:** `ListWorktrees(projectPath)`, `CreateWorktreeForChange(projectPath, changeName)`, `RemoveWorktree(projectPath, worktreePath)`, `LoadWorktreeActivity(projectPath, worktreePath)`; plus reuse of `LoadChange`/`ToggleTask`/`AddComment` pointed at a worktree path.
- **New Astro Actions:** `listWorktrees`, `createWorktreeForChange`, `removeWorktree`, `worktreeActivity` (the polled one).
- **Reused unchanged:** `project-discovery` (its one-level scan already keeps worktrees out of the project list) and `change-viewer` (its loader/serializer work on any openspec root).
- **UI:** a tab shell under the project picker; a `WorktreePanel` island (list + create dialog + per-worktree card with status + progress) that polls `worktreeActivity`; the existing `SpecViewer` reused for the worktree's change.
- **No breaking changes** (greenfield app; existing slices reused as-is).
