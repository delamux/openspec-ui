## 1. Domain (project-docs)

- [x] 1.1 RED→GREEN `DocumentPath`: normalises separators; rejects empty, absolute, `.`/`..` segments and non-document files; accepts `.md`, `.markdown` and `openspec/config.yaml`; exposes `name()` and `format()`
- [x] 1.2 RED→GREEN `DocumentPath.section()` classifies into config / agents / specs / docs
- [x] 1.3 RED→GREEN `ProjectDocumentIndex`: groups by section, README first in Docs, `defaultDocument()`
- [x] 1.4 `ProjectDocumentRepository` port + `InMemoryProjectDocumentRepository` with its own test

## 2. Application

- [x] 2.1 RED→GREEN `ListProjectDocuments` returns the index
- [x] 2.2 RED→GREEN `ReadProjectDocument` validates the path and throws not-found for a missing document
- [x] 2.3 DTOs (`toProjectDocumentsDto`, section labels) with a test

## 3. Filesystem adapter

- [x] 3.1 RED→GREEN `FileSystemProjectDocumentRepository.listDocumentPaths` over a temp dir: finds documents, skips ignored folders and symlinks
- [x] 3.2 RED→GREEN `readDocument` returns content, none when missing, and refuses a symlink that escapes the project

## 4. Actions and wiring

- [x] 4.1 Factory wires the repository and both use cases
- [x] 4.2 RED→GREEN `listProjectDocumentsHandler` / `readProjectDocumentHandler` (validation and not-found messages surface, technical errors are generalised); register the Actions

## 5. UI

- [x] 5.1 RED→GREEN `buildDocumentTree` (flat paths → nested folders, folders before files)
- [x] 5.2 RED→GREEN `splitFrontMatter`
- [x] 5.3 `ProjectPanel` (+ hook, CSS module): sidebar with sections and tree, viewer, default document, loading/error/empty states, stacked layout at ≤768px
- [x] 5.4 Third workspace tab "Project information" in `ChangeBrowser`
- [x] 5.5 Phone app bar: workspace tabs on their own full-width row under the brand, tab labels never wrap, so the three tabs fit at 360px (`responsive-layout` delta)

## 6. Verification

- [x] 6.1 `pnpm test` and `pnpm astro check` pass
- [x] 6.2 Open the Project information tab against a copy of this repository (plus a sample `.claude` skill) in a scripted Chromium at 1280, 768, 390 and 360px: config renders as YAML, skill front matter as a YAML block, specs and READMEs render, no horizontal page scroll
- [ ] 6.3 Decide with the Tech Lead whether `config.yaml` should become editable (follow-up change)
