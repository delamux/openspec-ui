## 1. Serializer (round-trip-safe `tasks.md` edits)

- [x] 1.1 RED→GREEN `applyTaskEdit(raw, op)` — `toggle`: locate by id, flip `[ ]`/`[x]`; assert every other line byte-identical
- [x] 1.2 RED→GREEN `editText`: replace only text after the id, preserve checkbox/id/indentation; reject empty text
- [x] 1.3 RED→GREEN `delete`: remove the task line and its trailing `ui:comment` block; stop at next task/heading; surrounding lines intact
- [x] 1.4 Locator guard: match by id + expected current text; throw a `stale` `DomainError` on drift; tasks with empty id are not editable
- [x] 1.5 RED→GREEN `add`: append `- [ ] <id> <text>` to the last group; derive id `<lastGroupNumber>.<next>`; ignore empty text
- [x] 1.6 Round-trip edge cases: CRLF, backticks/markdown in text, uppercase `[X]`, first/last task in a group, add at EOF (newline), comment block with no close marker

## 2. Repository write methods

- [x] 2.1 Surface missing `tasks.md` and stale-match as `DomainError` (no stack traces leaked)
- [x] 2.2 Extend `ChangeRepository` port with `toggleTask` / `editTaskText` / `deleteTask` / `addTask` (projectPath, changeName, payload); update `InMemoryChangeRepository` to apply `applyTaskEdit` to its seeded text, with tests
- [x] 2.3 RED→GREEN `FileSystemChangeRepository` write methods: resolve change dir → read `tasks.md` → `applyTaskEdit` → write back; integration tests use a real temp dir and assert round-trip on disk

## 3. Application use cases

- [x] 3.1 RED→GREEN `ToggleTask`, `EditTaskText`, `DeleteTask`, `AddTask` use cases over the repository (InMemory doubles, no mocks)
- [x] 3.2 Define edit result DTO (`{ kind: 'ok' } | { kind: 'stale' } | { kind: 'error', message }`) and map domain → DTO

## 4. Driving adapter (Astro Actions)

- [x] 4.1 Add Actions `toggleTask` / `editTaskText` / `deleteTask` / `addTask` (input: projectPath, changeName, id, expectedText, payload) delegating to the use cases via the Factory, test
- [x] 4.2 Extend the Factory to expose the four use cases; thin handler tests with injected in-memory deps (incl. the stale path)

## 5. Interactive Tasks UI

- [x] 5.1 Editing-state hook (single grouped `useState`): which task is being edited, the edit draft, the add draft, pending/error flags; actions call the Astro Actions
- [x] 5.2 Enable the `Checkbox` (onChange → toggle) in `TasksView`
- [x] 5.4 Hover delete button → lightweight confirm → delete
- [x] 5.5 Bottom "Add a task…" `Input` → add
- [x] 5.7 Keep read-only comments rendering; no destructuring of props/hooks; CSS Modules for any new styles

## 6. Verify

- [x] 6.1 `pnpm test` — all unit + integration tests green (serializer round-trip suite is the centerpiece)
- [x] 6.2 Manual (headless, incl. dark mode) on a scratch copy: toggle a task and confirm only that line changed in `tasks.md`; edit text; delete a task with a comment; add a task; confirm the file round-trips and the UI reflects disk
- [x] 6.3 `pnpm astro check` passes

## 7. Renumber & reorder (sortable)

- [x] 7.1 Serializer `renumberSection`: reassign a section's task ids to `N.1..N.n` in order, rewriting only changed lines (unchanged stay byte-identical); tests
- [x] 7.2 `delete` op renumbers its section after removing the task; round-trip tests (delete 6.3 → 6.4 becomes 6.3)
- [x] 7.3 `reorder` op `{groupTitle, orderedIds}`: reorder the section's task blocks (line + comment block) per orderedIds, then renumber; reject non-permutation as conflict; tests
- [x] 7.4 Repository/use case/action `reorderTasks`; InMemory structural reorder+renumber; handler maps conflict→stale
- [x] 7.5 Install @dnd-kit (/core, /sortable, /utilities); make each section a SortableContext with a drag handle; onDragEnd → reorderTasks + reload
- [x] 7.6 Verify: tests, astro check, E2E on a scratch project (delete renumbers; drag reorders + renumbers on disk)
