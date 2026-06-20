import { describe, it, expect } from 'vitest';
import {
  listWorktreesHandler,
  createWorktreeForChangeHandler,
  removeWorktreeHandler,
  worktreeActivityHandler,
  openWorktreeHandler,
} from './handlers';
import { Factory, type AppDependencies } from '../shared/infrastructure/factory';
import { InMemoryProjectsRootProvider } from '../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import { InMemoryProjectRepository } from '../modules/project-discovery/domain/repositories/ProjectRepository';
import { ProjectsRoot } from '../modules/project-discovery/domain/ProjectsRoot';
import { InMemoryChangeRepository } from '../modules/change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../modules/change-viewer/domain/Change';
import { InMemoryWorktreeRepository } from '../modules/worktree-management/domain/repositories/WorktreeRepository';
import { InMemoryAgentActivityProvider } from '../modules/worktree-management/domain/repositories/AgentActivityProvider';
import { InMemoryAgentTaskScaffolder } from '../modules/worktree-management/application/ports/AgentTaskScaffolder';
import { InMemoryEditorLauncher } from '../modules/worktree-management/application/ports/EditorLauncher';
import { Worktree } from '../modules/worktree-management/domain/Worktree';
import { AgentStatus } from '../modules/worktree-management/domain/AgentStatus';
import { noSessionActivity } from '../modules/worktree-management/domain/AgentActivity';
import { Maybe } from '../shared/domain/Maybe';

const wtPath = '/p/.claude/worktrees/add-auth';

function buildFactory(overrides: Partial<AppDependencies>): Factory {
  return Factory.withDependencies({
    provider: new InMemoryProjectsRootProvider(ProjectsRoot.create('/root')),
    repository: new InMemoryProjectRepository([]),
    changeRepository: new InMemoryChangeRepository(),
    worktreeRepository: new InMemoryWorktreeRepository(),
    agentActivityProvider: new InMemoryAgentActivityProvider(),
    agentTaskScaffolder: new InMemoryAgentTaskScaffolder(),
    editorLauncher: new InMemoryEditorLauncher(),
    ...overrides,
  });
}

describe('worktree action handlers', () => {
  it('listWorktreesHandler maps worktrees to dtos', async () => {
    const worktreeRepository = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const result = await listWorktreesHandler(buildFactory({ worktreeRepository }), { projectPath: '/p' });

    expect(result).toEqual({
      kind: 'ok',
      worktrees: [{ path: wtPath, branch: 'change/add-auth', isMain: false, changeName: 'add-auth', progress: null }],
    });
  });

  it('createWorktreeForChangeHandler creates and returns the worktree dto', async () => {
    const changeRepository = new InMemoryChangeRepository(new Map([['/p', [Change.create('add-auth', 'active')]]]));

    const result = await createWorktreeForChangeHandler(buildFactory({ changeRepository }), {
      projectPath: '/p',
      changeName: 'add-auth',
    });

    expect(result).toEqual({
      kind: 'ok',
      worktree: { path: wtPath, branch: 'change/add-auth', isMain: false, changeName: 'add-auth', progress: null },
    });
  });

  it('createWorktreeForChangeHandler returns stale when a worktree already exists', async () => {
    const changeRepository = new InMemoryChangeRepository(new Map([['/p', [Change.create('add-auth', 'active')]]]));
    const worktreeRepository = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const result = await createWorktreeForChangeHandler(buildFactory({ changeRepository, worktreeRepository }), {
      projectPath: '/p',
      changeName: 'add-auth',
    });

    expect(result).toEqual({ kind: 'stale' });
  });

  it('createWorktreeForChangeHandler returns an error for an unknown change', async () => {
    const result = await createWorktreeForChangeHandler(buildFactory({}), { projectPath: '/p', changeName: 'ghost' });

    expect(result.kind).toBe('error');
  });

  it('removeWorktreeHandler returns ok and refuses the main checkout', async () => {
    const worktreeRepository = new InMemoryWorktreeRepository(
      new Map([
        [
          '/p',
          [Worktree.create('/p', Maybe.some('main'), true), Worktree.create(wtPath, Maybe.some('change/add-auth'), false)],
        ],
      ]),
    );
    const factory = buildFactory({ worktreeRepository });

    expect(await removeWorktreeHandler(factory, { projectPath: '/p', worktreePath: wtPath })).toEqual({ kind: 'ok' });
    expect((await removeWorktreeHandler(factory, { projectPath: '/p', worktreePath: '/p' })).kind).toBe('error');
  });

  it('openWorktreeHandler opens the worktree via the editor launcher', async () => {
    const editorLauncher = new InMemoryEditorLauncher();

    const result = await openWorktreeHandler(buildFactory({ editorLauncher }), { worktreePath: wtPath });

    expect(result).toEqual({ kind: 'ok' });
    expect(editorLauncher.opened).toEqual([wtPath]);
  });

  it('worktreeActivityHandler maps live activity to dtos', async () => {
    const worktreeRepository = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );
    const agentActivityProvider = new InMemoryAgentActivityProvider(
      new Map([[wtPath, { ...noSessionActivity(), status: AgentStatus.fromKind('working') }]]),
    );

    const result = await worktreeActivityHandler(buildFactory({ worktreeRepository, agentActivityProvider }), {
      projectPath: '/p',
    });

    expect(result.kind).toBe('ok');
    expect(result.kind === 'ok' && result.items[0].activity.status).toBe('working');
  });
});
