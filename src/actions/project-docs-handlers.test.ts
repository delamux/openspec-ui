import { describe, it, expect } from 'vitest';
import { listProjectDocumentsHandler, readProjectDocumentHandler } from './handlers';
import { Factory } from '../shared/infrastructure/factory';
import { InMemoryProjectsRootProvider } from '../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../modules/project-discovery/domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../modules/project-discovery/domain/ProjectsRoot';
import { InMemoryChangeRepository } from '../modules/change-viewer/domain/repositories/ChangeRepository';
import { InMemoryWorktreeRepository } from '../modules/worktree-management/domain/repositories/WorktreeRepository';
import { InMemoryAgentActivityProvider } from '../modules/worktree-management/domain/repositories/AgentActivityProvider';
import { InMemoryAgentTaskScaffolder } from '../modules/worktree-management/application/ports/AgentTaskScaffolder';
import { InMemoryEditorLauncher } from '../modules/worktree-management/application/ports/EditorLauncher';
import {
  InMemoryProjectDocumentRepository,
  type ProjectDocumentRepository,
} from '../modules/project-docs/domain/repositories/ProjectDocumentRepository';
import { Maybe } from '../shared/domain/Maybe';
import type { DocumentPath } from '../modules/project-docs/domain/DocumentPath';
import { DomainError } from '../shared/domain/DomainError';

function buildFactory(documentRepository: ProjectDocumentRepository) {
  return Factory.withDependencies({
    provider: new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
    repository: new InMemoryProjectRepository([]),
    changeRepository: new InMemoryChangeRepository(),
    worktreeRepository: new InMemoryWorktreeRepository(),
    agentActivityProvider: new InMemoryAgentActivityProvider(),
    agentTaskScaffolder: new InMemoryAgentTaskScaffolder(),
    editorLauncher: new InMemoryEditorLauncher(),
    documentRepository,
  });
}

class FailingDocumentRepository implements ProjectDocumentRepository {
  async listDocumentPaths(): Promise<DocumentPath[]> {
    throw DomainError.create('EACCES: permission denied, scandir /secret/path');
  }

  async readDocument(): Promise<Maybe<string>> {
    throw DomainError.create('EACCES: permission denied, open /secret/path');
  }
}

const documents = new InMemoryProjectDocumentRepository(
  new Map([['/p', new Map([['README.md', '# Hi'], ['openspec/config.yaml', 'schema: spec-driven']])]]),
);

describe('project-docs action handlers', () => {
  it('listProjectDocumentsHandler returns the sections and the default document', async () => {
    expect(await listProjectDocumentsHandler(buildFactory(documents), { projectPath: '/p' })).toEqual({
      kind: 'ok',
      sections: [
        { id: 'config', label: 'Config', documents: ['openspec/config.yaml'] },
        { id: 'docs', label: 'Docs', documents: ['README.md'] },
      ],
      defaultDocument: 'openspec/config.yaml',
    });
  });

  it('readProjectDocumentHandler returns the document with its format', async () => {
    expect(await readProjectDocumentHandler(buildFactory(documents), { projectPath: '/p', path: 'README.md' })).toEqual({
      kind: 'ok',
      path: 'README.md',
      format: 'markdown',
      content: '# Hi',
    });
  });

  it('surfaces validation and not-found messages', async () => {
    const factory = buildFactory(documents);

    expect(await readProjectDocumentHandler(factory, { projectPath: '/p', path: '../x.md' })).toEqual({
      kind: 'error',
      message: 'Document path must stay inside the project',
    });
    expect(await readProjectDocumentHandler(factory, { projectPath: '/p', path: 'docs/missing.md' })).toEqual({
      kind: 'error',
      message: 'Document not found: docs/missing.md',
    });
  });

  it('generalises technical errors so no filesystem detail leaks', async () => {
    const factory = buildFactory(new FailingDocumentRepository());

    expect(await listProjectDocumentsHandler(factory, { projectPath: '/p' })).toEqual({
      kind: 'error',
      message: 'Could not read the project documents from disk',
    });
    expect(await readProjectDocumentHandler(factory, { projectPath: '/p', path: 'README.md' })).toEqual({
      kind: 'error',
      message: 'Could not read the project documents from disk',
    });
  });
});
