## Why

The change viewer renders tasks read-only. The whole point of having the task list in the UI is to *work* it — check items off, fix a wording typo, drop a task that's no longer needed, add one you forgot. This slice makes the Tasks tab interactive and writes every edit straight back into the project's real `tasks.md`, so the file on disk stays the single source of truth (and the AI/OpenSpec keep reading the same file).

The deferred read-only decision from `view-project-changes` was deliberate precisely so this slice could get the risky part right: **rewriting `tasks.md` without disturbing anything else in the file.**

## What Changes

- **Toggle done.** Clicking a task checkbox flips `- [ ]` ⇄ `- [x]` on that line in `tasks.md`. A done task is shown muted, **not struck through**.
- **Edit task text.** Click a task's text to edit it inline (Enter saves, Esc cancels); only the text after the id changes.
- **Delete task + renumber.** A hover delete button removes the task line and its attached `<!-- ui:comment -->` block (behind a lightweight confirm), then **renumbers the rest of that section** so ids stay sequential (delete `6.3` → `6.4` becomes `6.3`).
- **Add task per section.** Each `## N. Title` section has its own `+ Add task` control; a new `- [ ] <id> <text>` is appended inside that section with an auto-derived id (`<sectionNumber>.<maxSubIndex+1>`, collision-safe).
- **Reorder (sortable) + renumber.** Tasks are draggable within their section via a drag handle (@dnd-kit); on drop the new order is shown immediately, persisted to `tasks.md`, and the section is auto-renumbered to match.
- **Round-trip-safe writes.** Every operation is a surgical edit on the raw file text — untouched lines stay byte-identical (only renumbered ids change on delete/reorder). After a successful write the change is re-read from disk so the UI reflects the file, **without leaving the Tasks tab**.

Non-goals (separate slices): posting/editing **comments** (writing `ui:comment` blocks); editing proposal/design markdown; moving tasks **between** sections; creating/renaming sections; multi-user conflict resolution; undo history beyond the delete confirm.

## Capabilities

### New Capabilities
- `task-editing`: toggle, edit-text, delete, and add tasks in a change's `tasks.md`, persisted with round-trip fidelity (untouched content preserved exactly).

### Modified Capabilities
- `change-viewing`: the Tasks tab becomes interactive — its "render the change" requirement no longer states checkboxes/edits are non-interactive.

## Impact

- **change-viewer module:** new pure serializer `applyTaskEdit` (infrastructure/parser) for the four operations; `ChangeRepository` gains write methods; `FileSystemChangeRepository` reads → applies serializer → writes `tasks.md`; new use cases (`ToggleTask`, `EditTaskText`, `DeleteTask`, `AddTask`) and a DTO/result type.
- **Actions:** new Astro Actions `toggleTask`, `editTaskText`, `deleteTask`, `addTask` (input: projectPath, changeName, task locator, payload).
- **UI:** `SpecViewer` / `TasksView` become interactive (enabled `Checkbox` onChange, inline text edit, hover delete + confirm, bottom add input); reload the change after each write.
- **Concurrency:** edits locate a task by **id + expected current text**; a drifted on-disk line is rejected with a reload prompt rather than clobbered.
- **No breaking changes** — the read-only viewer simply gains interactivity; `tasks.md` format is unchanged.
