import { describe, it, expect } from 'vitest';
import { listProjectsHandler, listChangesHandler, loadChangeHandler, toggleTaskHandler } from './handlers';
import { Factory } from '../shared/infrastructure/factory';
import { InMemoryProjectsRootProvider } from '../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../modules/project-discovery/domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../modules/project-discovery/domain/ProjectsRoot';
import { Project } from '../modules/project-discovery/domain/Project';
import { InMemoryChangeRepository, type ChangeRepository } from '../modules/change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../modules/change-viewer/domain/Change';
import type { ChangeDetail } from '../modules/change-viewer/domain/ChangeDetail';
import { InMemoryWorktreeRepository } from '../modules/worktree-management/domain/repositories/WorktreeRepository';
import { InMemoryAgentActivityProvider } from '../modules/worktree-management/domain/repositories/AgentActivityProvider';
import { Maybe } from '../shared/domain/Maybe';
import { DomainError } from '../shared/domain/DomainError';

function buildFactory(changeRepository: ChangeRepository = new InMemoryChangeRepository()) {
  return Factory.withDependencies({
    provider: new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
    repository: new InMemoryProjectRepository([Project.fromDirectory('/root/app')]),
    changeRepository,
    worktreeRepository: new InMemoryWorktreeRepository(),
    agentActivityProvider: new InMemoryAgentActivityProvider(),
  });
}

describe('action handlers', () => {
  it('listProjectsHandler returns the discovery result dto', async () => {
    expect(await listProjectsHandler(buildFactory())).toEqual({
      kind: 'ok',
      projects: [{ name: 'app', path: '/root/app' }],
    });
  });

  it('listChangesHandler maps changes to summary dtos', async () => {
    const repo = new InMemoryChangeRepository(new Map([['/root/app', [Change.create('add-auth', 'active')]]]));

    expect(await listChangesHandler(buildFactory(repo), { projectPath: '/root/app' })).toEqual({
      kind: 'ok',
      changes: [{ name: 'add-auth', status: 'active' }],
    });
  });

  it('listChangesHandler maps active and archived statuses through the dto', async () => {
    const repo = new InMemoryChangeRepository(
      new Map([['/p', [Change.create('add-auth', 'active'), Change.create('2026-01-01-old', 'archived')]]]),
    );

    expect(await listChangesHandler(buildFactory(repo), { projectPath: '/p' })).toEqual({
      kind: 'ok',
      changes: [
        { name: 'add-auth', status: 'active' },
        { name: '2026-01-01-old', status: 'archived' },
      ],
    });
  });

  it('loadChangeHandler returns a view dto', async () => {
    const detail: ChangeDetail = { proposal: Maybe.some('# Why'), design: Maybe.none<string>(), tasks: Maybe.none() };
    const repo = new InMemoryChangeRepository(new Map(), new Map([['/root/app::add-auth', detail]]));

    const result = await loadChangeHandler(buildFactory(repo), { projectPath: '/root/app', changeName: 'add-auth' });

    expect(result).toEqual({
      kind: 'ok',
      view: { proposal: '# Why', design: null, tasks: null, progress: { done: 0, total: 0, pct: 0 } },
    });
  });

  it('toggleTaskHandler returns ok and applies the edit', async () => {
    const detail: ChangeDetail = {
      proposal: Maybe.none<string>(),
      design: Maybe.none<string>(),
      tasks: Maybe.some([{ title: '1. G', items: [{ id: '1.1', text: 'a', done: false, comments: [] }] }]),
    };
    const repo = new InMemoryChangeRepository(new Map(), new Map([['/p::c', detail]]));
    const factory = buildFactory(repo);

    expect(await toggleTaskHandler(factory, { projectPath: '/p', changeName: 'c', id: '1.1', expectedText: 'a' })).toEqual({
      kind: 'ok',
    });
    expect((await repo.loadChange('/p', 'c')).tasks.getOrThrow()[0].items[0].done).toBe(true);
  });

  it('toggleTaskHandler returns stale on a conflict', async () => {
    const detail: ChangeDetail = {
      proposal: Maybe.none<string>(),
      design: Maybe.none<string>(),
      tasks: Maybe.some([{ title: '1. G', items: [{ id: '1.1', text: 'a', done: false, comments: [] }] }]),
    };
    const repo = new InMemoryChangeRepository(new Map(), new Map([['/p::c', detail]]));

    expect(
      await toggleTaskHandler(buildFactory(repo), { projectPath: '/p', changeName: 'c', id: '1.1', expectedText: 'drifted' }),
    ).toEqual({ kind: 'stale' });
  });

  it('loadChangeHandler returns an error dto when the repository throws', async () => {
    const failing: ChangeRepository = {
      listChanges: async () => [],
      loadChange: async () => {
        throw DomainError.createNotFound('Change not found: "ghost"');
      },
      editTasks: async () => {},
    };

    expect(await loadChangeHandler(buildFactory(failing), { projectPath: '/p', changeName: 'ghost' })).toEqual({
      kind: 'error',
      message: 'Change not found: "ghost"',
    });
  });
});
