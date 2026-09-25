## 1. Domain (project-docs)

- [ ] 1.1 RED→GREEN `DocumentPath`: normalises separators; rejects empty, absolute, `.`/`..` segments and non-document files; accepts `.md`, `.markdown` and `openspec/config.yaml`; exposes `name()` and `format()`
- [ ] 1.2 RED→GREEN `DocumentPath.section()` classifies into config / agents / specs / docs
- [ ] 1.3 RED→GREEN `ProjectDocumentIndex`: groups by section, README first in Docs, `defaultDocument()`
- [ ] 1.4 `ProjectDocumentRepository` port + `InMemoryProjectDocumentRepository` with its own test

## 2. Application

- [ ] 2.1 RED→GREEN `ListProjectDocuments` returns the index
- [ ] 2.2 RED→GREEN `ReadProjectDocument` validates the path and throws not-found for a missing document
- [ ] 2.3 DTOs (`toProjectDocumentsDto`, section labels) with a test

## 3. Filesystem adapter

- [ ] 3.1 RED→GREEN `FileSystemProjectDocumentRepository.listDocumentPaths` over a temp dir: finds documents, skips ignored folders and symlinks
- [ ] 3.2 RED→GREEN `readDocument` returns content, none when missing, and refuses a symlink that escapes the project

## 4. Actions and wiring

- [ ] 4.1 Factory wires the repository and both use cases
- [ ] 4.2 RED→GREEN `listProjectDocumentsHandler` / `readProjectDocumentHandler` (validation and not-found messages surface, technical errors are generalised); register the Actions

## 5. UI

- [ ] 5.1 RED→GREEN `buildDocumentTree` (flat paths → nested folders, folders before files)
- [ ] 5.2 RED→GREEN `splitFrontMatter`
- [ ] 5.3 `ProjectPanel` (+ hook, CSS module): sidebar with sections and tree, viewer, default document, loading/error/empty states, stacked layout at ≤768px
- [ ] 5.4 Third workspace tab "Project" in `ChangeBrowser`

## 6. Verification

- [ ] 6.1 `pnpm test` and `pnpm astro check` pass
- [ ] 6.2 Open the Project tab against this repository in a browser: config, skills, specs and README render
