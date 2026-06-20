import { describe, it, expect } from 'vitest';
import { Factory } from './factory';
import { DiscoverProjects } from '../../modules/project-discovery/application/DiscoverProjects';
import { ListChanges } from '../../modules/change-viewer/application/ListChanges';
import { LoadChange } from '../../modules/change-viewer/application/LoadChange';
import { InMemoryProjectsRootProvider } from '../../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../../modules/project-discovery/domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../../modules/project-discovery/domain/ProjectsRoot';
import { Project } from '../../modules/project-discovery/domain/Project';
import { InMemoryChangeRepository } from '../../modules/change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../../modules/change-viewer/domain/Change';
import { ListWorktrees } from '../../modules/worktree-management/application/ListWorktrees';
import { InMemoryWorktreeRepository } from '../../modules/worktree-management/domain/repositories/WorktreeRepository';
import { InMemoryAgentActivityProvider } from '../../modules/worktree-management/domain/repositories/AgentActivityProvider';

describe('Factory', () => {
  it('builds the use cases from the environment', () => {
    const factory = Factory.fromEnv();

    expect(factory.discoverProjects()).toBeInstanceOf(DiscoverProjects);
    expect(factory.listChanges()).toBeInstanceOf(ListChanges);
    expect(factory.loadChange()).toBeInstanceOf(LoadChange);
    expect(factory.listWorktrees()).toBeInstanceOf(ListWorktrees);
  });

  it('wires injected in-memory dependencies end to end', async () => {
    const factory = Factory.withDependencies({
      provider: new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
      repository: new InMemoryProjectRepository([Project.fromDirectory('/root/app')]),
      changeRepository: new InMemoryChangeRepository(new Map([['/root/app', [Change.create('c', 'active')]]])),
      worktreeRepository: new InMemoryWorktreeRepository(),
      agentActivityProvider: new InMemoryAgentActivityProvider(),
    });

    expect(await factory.discoverProjects().execute()).toEqual({
      kind: 'ok',
      projects: [Project.fromDirectory('/root/app')],
    });
    expect((await factory.listChanges().execute('/root/app')).map((c) => c.name)).toEqual(['c']);
  });
});
