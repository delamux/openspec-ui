## Context

`view-project-changes` renders `tasks.md` read-only. This slice makes the Tasks tab write back to the file. The viewer, parser, `ChangeRepository`, and Astro Actions already exist; the new surface is **mutating `tasks.md`** for four operations (toggle, edit text, delete, add) plus the interactive UI.

The dominant risk is **round-trip fidelity** — a user editing one task must never corrupt the rest of their real spec file. Everything in this design is shaped by that.

## Goals / Non-Goals

**Goals:**
- Toggle / edit-text / delete / add tasks, persisted to `tasks.md`.
- A pure, exhaustively tested serializer that changes only the targeted line(s).
- Interactive Tasks tab (checkbox, inline edit, hover delete + confirm, bottom add) that re-reads the file after each write.

**Non-Goals:**
- Posting/editing comments (`ui:comment` blocks) — next slice.
- Editing proposal/design; reordering tasks; moving between groups; creating/renaming groups.
- Optimistic UI, undo history, multi-user conflict resolution.

## Decisions

### 1. Surgical line edits on raw text — never regenerate from the model
The parser intentionally discards headings prose, blank lines, and non-task content, so re-serializing the parsed model would lose them. Instead a pure `applyTaskEdit(rawText, op): string` operates on the original text and rewrites only the targeted line(s). **Invariant (the core test):** for any op, every line not targeted is byte-identical. Alternative considered: a lossless full-fidelity parse+regenerate — rejected as more code and more ways to drift than surgical edits.

### 2. The four operations
- **toggle(id, expectedText)** — find the task line; flip the checkbox char (`[ ]`↔`[x]`); nothing else.
- **editText(id, expectedText, newText)** — replace only the text after the id; keep the checkbox, id, and leading indentation. Reject empty `newText`.
- **delete(id, expectedText)** — remove the task line and any immediately-following `<!-- ui:comment … -->`…`<!-- /ui:comment -->` block(s) that belong to it; stop at the next task/heading.
- **add(groupTitle, text)** — locate the group by its `## N. Title`, append `- [ ] <id> <text>` after that group's last task (before the next heading); derive `<id>` as `<groupNumber>.<maxSubIndex+1>` so it never collides after a delete. Each section has its own `+` control in the UI.

### 2c. Renumber-on-delete and reorder (added)
- **delete** now calls `renumberSection` after removing the task: each remaining task in that section is reassigned `N.1`, `N.2`, … in file order. Only lines whose id actually changes are rewritten (unchanged tasks stay byte-identical).
- A new **reorder** op `{ kind: 'reorder'; groupTitle; orderedIds: string[] }` rewrites a section's task **blocks** (task line + its comment block) into the given order of current ids, then renumbers. `orderedIds` must be a permutation of the section's current ids — otherwise it's rejected as a stale conflict.
- Reordering is **within a section only** (the section number never changes), matching the renumber-by-section model.
- UI uses **@dnd-kit** (`/core` + `/sortable`) — accessible, touch- and keyboard-friendly sortable lists, one `SortableContext` per section, with a drag handle so dragging doesn't conflict with the checkbox / click-to-edit. On drag end the UI sends the new order of ids to the `reorderTasks` action and reloads.

### 2b. Locate by id + expected text (optimistic concurrency)
Operations carry the task `id` **and** the text the UI last loaded. The serializer matches the line by id and verifies its current text equals `expectedText`; on mismatch it throws a "stale" `DomainError` and the op is rejected. **Why:** reads are fresh and this is a local single-user tool, but a drifted line (file edited in an editor meanwhile) must not be clobbered — fail safe and prompt a reload. Tasks with an empty id (rare/malformed) are not editable in this slice.

### 3. Repository write methods + FileSystem adapter
`ChangeRepository` gains `toggleTask`, `editTaskText`, `deleteTask`, `addTask` (each takes projectPath, changeName, and the op payload). `FileSystemChangeRepository` resolves the change dir, reads `tasks.md`, calls `applyTaskEdit`, and writes it back; a missing `tasks.md` or stale match surfaces as a `DomainError`. `InMemoryChangeRepository` applies the same serializer to its seeded text so use-case tests need no disk.

### 4. Use cases + one Action per operation
`ToggleTask` / `EditTaskText` / `DeleteTask` / `AddTask` are thin application use cases over the repository. Astro Actions `toggleTask` / `editTaskText` / `deleteTask` / `addTask` deserialize input → one use case → a small result DTO (`{ kind: 'ok' } | { kind: 'error', message }` or `{ kind: 'stale' }`). Handlers stay logic-free and are unit-tested with the in-memory factory.

### 5. UI: interactive Tasks tab, reload after write
`TasksView` becomes interactive: enabled `Checkbox` (onChange → toggle), click-the-text inline edit (Enter saves / Esc cancels, an `Input` primitive), a hover delete button behind a small confirm, and the bottom "Add a task…" `Input`. After any successful Action the `ChangeBrowser` **re-runs `loadChange`** so the UI shows the persisted file. **Why reload over optimistic:** it always reflects disk truth (round-trip visible) and is simplest to reason about for a local tool. Editing state (which task is being edited, the draft, the add draft) lives in a single grouped `useState` in a hook, per the frontend conventions.

### 6. Comments stay read-only here
The design couples delete with a comment composer, but comment-posting (writing `ui:comment` blocks, the AI-feedback loop) is its own slice. This slice keeps existing comments visible and read-only; the delete op still cleans up a task's comment block.

## Risks / Trade-offs

- **Serializer edge cases** → cover with round-trip tests: CRLF, backticks/markdown in task text, a task whose comment block has no close marker, deleting the first/last task in a group, adding when the last group ends at EOF (newline handling), uppercase `[X]`, and a heading with no leading number (add id falls back / is disallowed).
- **Destructive delete on a real file** → confirm before write; the removed lines are recoverable via git in the target project, not via in-app undo (documented).
- **Stale snapshot** → id + expected-text guard rejects rather than clobbers; UI prompts reload.
- **Add-to-last-group only** → if users want per-section add, that's a follow-up; one bottom input matches the design.
- **Reload-after-write latency** → negligible for local files; revisit with optimistic updates only if it feels slow.

## Migration Plan

Greenfield feature on top of the read-only viewer; no data migration. Rollback = revert the branch. The only persisted effect is edits the user makes to their own `tasks.md` (tracked by that project's own git).

## Open Questions

- Inline-edit affordance: click-the-text vs a pencil-on-hover. Leaning click-the-text (fewer controls), with a visible hover hint.
- Should `add` allow choosing the target group later? Out of scope now; one bottom input → last group.
