import { describe, it, expect } from 'vitest';
import { DiscoverProjects } from './DiscoverProjects';
import { InMemoryProjectsRootProvider } from '../domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../domain/repositories/ProjectRepository';
import type { ProjectsRootProvider } from '../domain/repositories/ProjectsRootProvider';
import type { ProjectRepository } from '../domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../domain/ProjectsRoot';
import { Project } from '../domain/Project';
import { DomainError } from '../../../shared/domain/DomainError';

describe('DiscoverProjects', () => {
  it('returns not-configured when no root is provided', async () => {
    const useCase = new DiscoverProjects(
      new InMemoryProjectsRootProvider(),
      new InMemoryProjectRepository(),
    );

    expect(await useCase.execute()).toEqual({ kind: 'not-configured' });
  });

  it('returns ok with the discovered projects', async () => {
    const project = Project.fromDirectory('/root/app');
    const useCase = new DiscoverProjects(
      new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
      new InMemoryProjectRepository([project]),
    );

    expect(await useCase.execute()).toEqual({ kind: 'ok', projects: [project] });
  });

  it('returns ok with an empty list when the root has no projects', async () => {
    const useCase = new DiscoverProjects(
      new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
      new InMemoryProjectRepository([]),
    );

    expect(await useCase.execute()).toEqual({ kind: 'ok', projects: [] });
  });

  it('returns a discovery-error when the repository fails', async () => {
    const failing: ProjectRepository = {
      discoverUnder: async () => {
        throw DomainError.createNotFound('Projects root no longer exists: "/root"');
      },
    };
    const useCase = new DiscoverProjects(
      new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
      failing,
    );

    expect(await useCase.execute()).toEqual({
      kind: 'discovery-error',
      message: 'Projects root no longer exists: "/root"',
    });
  });

  it('returns a discovery-error when the configured root is invalid', async () => {
    const misconfigured: ProjectsRootProvider = {
      find: async () => {
        throw DomainError.createValidation('Projects root path must be absolute: "relative"');
      },
    };
    const useCase = new DiscoverProjects(misconfigured, new InMemoryProjectRepository());

    expect(await useCase.execute()).toEqual({
      kind: 'discovery-error',
      message: 'Projects root path must be absolute: "relative"',
    });
  });
});
