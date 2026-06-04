import { describe, it, expect } from 'vitest';
import { listProjectsHandler } from './handlers';
import { Factory } from '../shared/infrastructure/factory';
import { InMemoryProjectsRootProvider } from '../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../modules/project-discovery/domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../modules/project-discovery/domain/ProjectsRoot';
import { Project } from '../modules/project-discovery/domain/Project';

describe('action handlers', () => {
  it('listProjectsHandler returns not-configured when no root is set', async () => {
    const factory = Factory.withDependencies({
      provider: new InMemoryProjectsRootProvider(),
      repository: new InMemoryProjectRepository(),
    });

    expect(await listProjectsHandler(factory)).toEqual({ kind: 'not-configured' });
  });

  it('listProjectsHandler returns the discovery result dto for the configured root', async () => {
    const factory = Factory.withDependencies({
      provider: new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
      repository: new InMemoryProjectRepository([Project.fromDirectory('/root/app')]),
    });

    expect(await listProjectsHandler(factory)).toEqual({
      kind: 'ok',
      projects: [{ name: 'app', path: '/root/app' }],
    });
  });
});
