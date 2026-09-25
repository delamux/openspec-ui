## Why

Once a project is selected, openspec-ui only shows its changes and worktrees. The rest of what drives the AI in that project is invisible: the OpenSpec `config.yaml` (schema and the context fed to every artifact), the skills and agent instructions under `.claude/` or `.agents/`, `CLAUDE.md` / `AGENTS.md`, the capability specs in `openspec/specs/`, and the README and any other docs. To check them today you leave the UI and open the files in an editor. Issue #6 asks for a project section that shows the OpenSpec configuration, a file explorer for the skills and agent folders, and any markdown of the project, starting with the README.

## What Changes

- **New "Project" workspace tab** next to Changes and Worktrees, shown once a project is selected.
- **Document explorer.** A sidebar lists the project's documents as a folder tree, grouped into four sections:
  - **Config**: `openspec/config.yaml`.
  - **Agents & skills**: everything under `.claude/`, `.agents/`, `agents/` and `.github/`, plus `CLAUDE.md` and `AGENTS.md` anywhere.
  - **Specs**: `openspec/specs/**`.
  - **Docs**: every other markdown file (README first).
- **Document viewer.** Markdown is rendered with the existing renderer. YAML front matter, as found at the top of skills, is shown as a highlighted YAML block above the body. `config.yaml` is shown as a highlighted YAML block.
- The tab opens on `openspec/config.yaml`, or on the README when the project has no config.
- **Read-only.** The config is shown, not edited. The issue leaves editing open; it is a follow-up once we agree on validation and on how to keep comments and formatting when saving YAML.

Non-goals:
- Editing `config.yaml` or any other document from the UI.
- Non-markdown files (source code, images, JSON) in the explorer.
- Change folders (`openspec/changes/**`); the Changes tab already covers them.
- Following symbolic links, or listing dependency and build folders (`node_modules`, `.git`, `dist`, …).

## Capabilities

### New Capabilities
- `project-documents`: listing a project's documents grouped into sections, and reading one of them safely (only markdown files and the OpenSpec config, only inside the project folder).

### Modified Capabilities
- `responsive-layout`: the phone app bar holds three workspace tabs, so the brand shows its logo only at ≤640px.

## Impact

- New slice `src/modules/project-docs/` (domain, application, `infrastructure/fs`, `infrastructure/ui`).
- `src/shared/infrastructure/factory.ts`: wires `FileSystemProjectDocumentRepository` and the two use cases.
- `src/actions/`: `listProjectDocuments` and `readProjectDocument` Actions and handlers.
- `ChangeBrowser.tsx` / `.hook.ts` / `.module.css`: third workspace tab; on phones the brand shows its logo only so the three tabs fit. `SpecViewer/markdown.ts` exports its code-block renderer so the YAML viewer can reuse it.
- **No new dependencies. No breaking changes.**
