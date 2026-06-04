import { describe, it, expect } from 'vitest';
import { Factory } from './factory';
import { DiscoverProjects } from '../../modules/project-discovery/application/DiscoverProjects';
import { InMemoryProjectsRootProvider } from '../../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../../modules/project-discovery/domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../../modules/project-discovery/domain/ProjectsRoot';
import { Project } from '../../modules/project-discovery/domain/Project';

describe('Factory', () => {
  it('builds the discover-projects use case from the environment', () => {
    expect(Factory.fromEnv().discoverProjects()).toBeInstanceOf(DiscoverProjects);
  });

  it('wires injected in-memory dependencies end to end', async () => {
    const factory = Factory.withDependencies({
      provider: new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
      repository: new InMemoryProjectRepository([Project.fromDirectory('/root/app')]),
    });

    expect(await factory.discoverProjects().execute()).toEqual({
      kind: 'ok',
      projects: [Project.fromDirectory('/root/app')],
    });
  });
});
