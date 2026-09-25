## Context

The app is one React island (`ChangeBrowser`) with Changes and Worktrees tabs. Every slice follows the same shape: domain value objects and a repository port with an InMemory implementation, one use case class per operation, a filesystem adapter, an Astro Action as the driving adapter, and a React panel. The projects root is configured, but Actions receive `projectPath` from the client, so an adapter that reads a path inside a project must keep the path confined to that project.

## Goals / Non-Goals

**Goals:**
- Show `openspec/config.yaml`, agent/skill documents, specs and other markdown of the selected project.
- A file-explorer feel: a folder tree per section, the selected file rendered next to it.
- Reading a document can never reach outside the project folder, or a file that is not a document.

**Non-Goals:**
- Editing documents, including the config (see proposal).
- Watching the filesystem for changes. The tab reloads its list when it is opened.

## Decisions

### 1. A new `project-docs` slice
Documents are a different concept from changes (no tasks, no lifecycle), so they get their own slice instead of growing `change-viewer`. The slice's only link to the others is the UI: `ProjectPanel` reuses `renderMarkdown` from the change viewer. `WorktreePanel` already reuses the change viewer's UI in the same way.

### 2. `DocumentPath` is where the safety rule lives
`DocumentPath.create(raw)` normalises separators and rejects an empty path, an absolute path, any `.` or `..` segment, and anything that is not a markdown file (`.md`, `.markdown`) or exactly `openspec/config.yaml`. Both the listing and the read go through it, so the rule is in one place and unit-tested in the domain. The filesystem adapter adds a second, technical check: it resolves the real path of the file and of the project and refuses a file whose real path is outside the project. That check catches a symbolic link that points out of the project.

### 3. Sections are classified in the domain
`DocumentSection` (`config`, `agents`, `specs`, `docs`) is derived from the path by `DocumentPath.section()`. `ProjectDocumentIndex` holds the classified documents, sorts each section (README files first in Docs, then alphabetical by path) and answers `defaultDocument()` (config, else the root README, else the first document). The UI does not repeat these rules.

### 4. Walking the project
The adapter walks the project with `readdir(..., { withFileTypes: true })`. It does not follow symbolic links: a symlinked entry is neither `isFile()` nor `isDirectory()` on a `Dirent`. It skips `.git`, `node_modules`, build and cache folders, and `openspec/changes`. Hidden folders are walked, because `.claude`, `.agents` and `.github` are exactly what the issue asks for. The walk stops at depth 8 and at 2000 documents, so a very large folder cannot stall the request.

### 5. Front matter is split in the UI
Skills start with a YAML front matter block (`---` … `---`). The markdown renderer would read it as a horizontal rule followed by paragraphs. A small pure helper, `splitFrontMatter`, separates it, and the viewer shows it as a highlighted YAML block above the body. This is presentation only, so it lives in `infrastructure/ui` next to its test.

### 6. The tree is built in the UI from flat paths
The Action returns flat paths per section. `buildDocumentTree` turns one section's paths into nested folders and files. It is a pure function with its own test. Directory nodes are open by default. The tree is small, so it is rendered in full with no virtualisation.

## Risks / Trade-offs

- A very large monorepo may hit the 2000-document cap and show a partial list. The cap is a constant in the adapter and can be raised.
- `projectPath` still comes from the client, as it does for every other Action. The adapter never reads outside it, and only documents can be read, so the exposure is limited to markdown and the OpenSpec config.
