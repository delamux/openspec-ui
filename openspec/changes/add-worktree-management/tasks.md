## 1. Domain — value objects (worktree-management)

- [x] 1.1 RED→GREEN `WorktreeName` value object: factory validates non-empty and `[A-Za-z0-9._/-]` only; rejects spaces, shell metacharacters, and `..` traversal with `DomainError.createValidation()`
- [x] 1.2 RED→GREEN `BranchName` value object: factory derives/validates a git-ref-safe name; `BranchName.forChange(name)` yields `change/<name>`
- [x] 1.3 RED→GREEN `Worktree` value object: `path`, `branch` (or detached indicator), `isMain`, optional `head`; factory completes the object, no setters
- [x] 1.4 RED→GREEN `AgentStatus` value object: the closed set working/thinking/waiting/done/idle/no-session, with helpers for display

## 2. Domain — ports + InMemory implementations

- [x] 2.1 RED→GREEN `WorktreeRepository` port: `list(projectPath)`, `create(projectPath, name, branch)`, `remove(projectPath, worktreePath)`; co-located `InMemoryWorktreeRepository` (seeded worktrees, records create/remove) for use-case tests
- [x] 2.2 RED→GREEN `AgentActivityProvider` port: `activityFor(worktreePath): AgentActivity` carrying `status`, last tool, last file (+line), last message, token count, last-activity time; co-located `InMemoryAgentActivityProvider`
- [x] 2.3 Define the main-checkout guard as domain behavior (`Worktree.ensureRemovable()`), enforced by the RemoveWorktree use case

## 3. Application — use cases + DTOs

- [x] 3.1 RED→GREEN `ListWorktrees(projectPath)`: returns the project's worktrees (main + those under `.claude/worktrees/`); never throws on a project with only the main checkout
- [x] 3.2 RED→GREEN `CreateWorktreeForChange(projectPath, changeName)`: validates the change exists in the project's `openspec/changes/`, derives `change/<name>` + `.claude/worktrees/<name>`, delegates to the repository; maps already-exists to a conflict (pre-check in the use case)
- [x] 3.3 RED→GREEN `RemoveWorktree(projectPath, worktreePath)`: refuses the main checkout; errors on an unknown worktree
- [x] 3.4 RED→GREEN `GetWorktreesActivity(projectPath)`: returns each worktree's `AgentActivity`, `no-session` when none
- [x] 3.5 Define serializable DTOs (worktree with branch/isMain/changeName/progress; activity items; create/remove results) and map domain → DTOs; reuse the `kind: 'ok' | 'error' | 'stale'` result shape
- [x] 3.6 Reuse `change-viewer`: `ListWorktrees` calls the `ChangeRepository` port on each worktree's path to compute its in-progress change progress (no change to change-viewer; no use-case-to-use-case call)

## 4. Infrastructure — git adapter (infrastructure/git)

- [x] 4.1 RED→GREEN `GitWorktreeRepository.list`: run `git worktree list --porcelain` (cwd = projectPath), parse `worktree`/`branch`/`bare`/`detached` blocks, mark index 0 as main, filter to main + `.claude/worktrees/*`; integration tests against a real temp git repo
- [x] 4.2 RED→GREEN `GitWorktreeRepository.create`: `git show-ref --verify --quiet refs/heads/<branch>` then `git worktree add <path> <branch>` (exists) or `git worktree add -b <branch> <path>` (new); pass argv as an array (no shell string); integration tests create+verify in a temp repo
- [x] 4.3 RED→GREEN `GitWorktreeRepository.remove`: `git worktree remove --force <path>`; integration test creates then removes
- [x] 4.4 Surface git failures (non-zero exit, not-a-repo, locked worktree) as `DomainError` without leaking stderr/stack; tolerant porcelain parsing (unknown blocks skipped)

## 5. Infrastructure — session activity adapter (infrastructure/session)

- [x] 5.1 RED→GREEN path-encoder: map a worktree absolute path to its `~/.claude/projects/<encoded>` directory (every non-alphanumeric → `-`), isolated in one tested function
- [x] 5.2 RED→GREEN `deriveActivity` (pure, clock injected) + `ClaudeSessionActivityProvider.activityFor`: pick the most recent `*.jsonl`, parse entries tolerantly (skip malformed lines), derive `AgentStatus` + last tool/file/line/message + token count + last-activity; `no-session` when the directory is absent
- [x] 5.3 Integration test with a temp `~/.claude/projects`-shaped fixture (inject the projects root + clock): assert working/no-session and that repeated reads are side-effect free

## 6. Composition root & Actions

- [x] 6.1 Extend `Factory.fromEnv()` to build `GitWorktreeRepository` + `ClaudeSessionActivityProvider` and expose `ListWorktrees`, `CreateWorktreeForChange`, `RemoveWorktree`, and `GetWorktreesActivity`; keep `withDependencies` for tests
- [x] 6.2 Add Astro Actions `listWorktrees`, `createWorktreeForChange`, `removeWorktree`, `worktreeActivity` with zod input schemas; thin handlers delegating to use cases, mapping `DomainError` → result DTO (`ok`/`error`/`stale`)
- [x] 6.3 Handler tests with injected in-memory deps: create→appears, remove→gone, main-remove rejected, activity returns status

## 7. UI — tabs shell + WorktreePanel island

- [x] 7.1 Add a `Tabs` shell under the shared project `<Select>`: **Changes** (existing `ChangeBrowser` view) and **Worktrees** (the change picker hides on the Worktrees tab). NOTE: in-memory tab state only — `?tab=` URL persistence deferred to a follow-up (would need to extend `syncUrl`)
- [x] 7.2 Build the `WorktreePanel` island + single-`useState` `.hook.ts`: load worktrees via `actions.listWorktrees`; render a card per worktree (branch, main flag, status dot, task-progress bar, last tool/file)
- [x] 7.3 "New worktree for change" dialog: a `<Select>` of the project's active changes → `actions.createWorktreeForChange`; show the conflict (`stale`) state when a worktree already exists
- [x] 7.4 Remove control on non-main worktrees → `actions.removeWorktree`; hide/disable on the main checkout
- [x] 7.5 Live polling: re-call `actions.worktreeActivity` on a ~3s `setInterval` (cleared on unmount; paused when `document.hidden`), folding results into the single state; hydration-safe (no browser reads in the `useState` initializer)
- [x] 7.6 Review the live copy: selecting a worktree's change opens `SpecViewer` against the **worktree's** path; toggles/comments write to the worktree's `openspec` (reusing `ToggleTask`/`AddComment`); label clearly that this edits the worktree copy

## 8. Verify

- [x] 8.1 `pnpm test` — all unit + integration tests green (domain, use cases, git adapter against temp repos, session adapter against a fixture, handlers)
- [x] 8.2 `pnpm astro check` passes (types clean)
- [ ] 8.3 Manual via `pnpm dev`: pick a project, open Worktrees, create a worktree for an existing change, confirm `git worktree list` shows it under `.claude/worktrees/`, run a Claude agent in it and confirm the status dot and task progress update on poll, drop a comment and confirm it lands in the worktree's `tasks.md`, then remove the worktree

## 9. Agent bootstrap on create (Option A — prepare + open, no headless launch)

- [x] 9.1 `AgentTaskScaffolder` + `EditorLauncher` application ports (`application/ports/`) with InMemory fakes for use-case tests
- [x] 9.2 `CreateWorktreeForChange` scaffolds the agent task right after creating the worktree (no scaffold on conflict); new `OpenWorktree` use case
- [x] 9.3 `FileSystemAgentTaskScaffolder`: copy `.claude/skills` + `.claude/agents` into the new worktree (so `/openspec-apply-change` exists there), write `CLAUDE_TASK.md` (apply-change prompt naming the change) and `.vscode/tasks.json` (folderOpen → `claude`); temp-dir integration tests, tolerant when the project has no `.claude`
- [x] 9.4 `VsCodeEditorLauncher` shells `code <path>` (command injectable; failure → `DomainError`); failure-path test
- [x] 9.5 Factory wiring + `openWorktree` action/handler; "Open in VS Code" button on each worktree card + a post-create hint to open it

## 10. Changes picker sees worktree-only changes

- [x] 10.1 RED→GREEN `ListSelectableChanges(projectPath)` (worktree-management; uses the `ChangeRepository` + `WorktreeRepository` ports): main changes (active + archived, loaded from the project) plus each worktree's **active** changes (so the live worktree copy of a change is selectable, even when it also exists on main), each carrying its `sourcePath` and worktree label; archived worktree copies are skipped to keep the picker focused; tolerant if a worktree's change list fails
- [x] 10.2 `SelectableChangeDto` (key/name/status/label/sourcePath/isWorktree) in change-viewer dtos; `toSelectableChangeDto` mapper in worktree-management (keeps the slice dependency pointing change-viewer → none); `listSelectableChanges` action + handler test asserting the worktree label and source path
- [x] 10.3 ChangeBrowser picker loads from `listSelectableChanges`; selecting a change loads/edits from its `sourcePath` (so a worktree-only change opens its worktree copy); main changes still deep-link via `?change=` (worktree-only changes are not deep-linked)
