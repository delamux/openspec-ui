## 1. Serializer (round-trip-safe `tasks.md` edits)

- [ ] 1.1 RED→GREEN `applyTaskEdit(raw, op)` — `toggle`: locate by id, flip `[ ]`/`[x]`; assert every other line byte-identical
- [ ] 1.2 RED→GREEN `editText`: replace only text after the id, preserve checkbox/id/indentation; reject empty text
- [ ] 1.3 RED→GREEN `delete`: remove the task line and its trailing `ui:comment` block; stop at next task/heading; surrounding lines intact
- [ ] 1.4 RED→GREEN `add`: append `- [ ] <id> <text>` to the last group; derive id `<lastGroupNumber>.<next>`; ignore empty text
- [ ] 1.5 Locator guard: match by id + expected current text; throw a `stale` `DomainError` on drift; tasks with empty id are not editable
- [ ] 1.6 Round-trip edge cases: CRLF, backticks/markdown in text, uppercase `[X]`, first/last task in a group, add at EOF (newline), comment block with no close marker

## 2. Repository write methods

- [ ] 2.1 Extend `ChangeRepository` port with `toggleTask` / `editTaskText` / `deleteTask` / `addTask` (projectPath, changeName, payload); update `InMemoryChangeRepository` to apply `applyTaskEdit` to its seeded text, with tests
- [ ] 2.2 RED→GREEN `FileSystemChangeRepository` write methods: resolve change dir → read `tasks.md` → `applyTaskEdit` → write back; integration tests use a real temp dir and assert round-trip on disk
- [ ] 2.3 Surface missing `tasks.md` and stale-match as `DomainError` (no stack traces leaked)

## 3. Application use cases

- [ ] 3.1 RED→GREEN `ToggleTask`, `EditTaskText`, `DeleteTask`, `AddTask` use cases over the repository (InMemory doubles, no mocks)
- [ ] 3.2 Define edit result DTO (`{ kind: 'ok' } | { kind: 'stale' } | { kind: 'error', message }`) and map domain → DTO

## 4. Driving adapter (Astro Actions)

- [ ] 4.1 Add Actions `toggleTask` / `editTaskText` / `deleteTask` / `addTask` (input: projectPath, changeName, id, expectedText, payload) delegating to the use cases via the Factory
- [ ] 4.2 Extend the Factory to expose the four use cases; thin handler tests with injected in-memory deps (incl. the stale path)

## 5. Interactive Tasks UI

- [ ] 5.1 Editing-state hook (single grouped `useState`): which task is being edited, the edit draft, the add draft, pending/error flags; actions call the Astro Actions
- [ ] 5.2 Enable the `Checkbox` (onChange → toggle) in `TasksView`
- [ ] 5.3 Inline text edit: click the task text → `Input` (Enter saves, Esc cancels) → editText
- [ ] 5.4 Hover delete button → lightweight confirm → delete
- [ ] 5.5 Bottom "Add a task…" `Input` → add
- [ ] 5.6 After any successful edit, reload the change (re-run `loadChange`); surface `stale` with a "reload" prompt and `error` inline
- [ ] 5.7 Keep read-only comments rendering; no destructuring of props/hooks; CSS Modules for any new styles

## 6. Verify

- [ ] 6.1 `pnpm test` — all unit + integration tests green (serializer round-trip suite is the centerpiece)
- [ ] 6.2 `pnpm astro check` passes
- [ ] 6.3 Manual (headless, incl. dark mode) on a scratch copy: toggle a task and confirm only that line changed in `tasks.md`; edit text; delete a task with a comment; add a task; confirm the file round-trips and the UI reflects disk
