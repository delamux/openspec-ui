import { describe, it, expect } from 'vitest';
import { CreateWorktreeForChange } from './CreateWorktreeForChange';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { Worktree } from '../domain/Worktree';
import { Maybe } from '../../../shared/domain/Maybe';
import { DomainError } from '../../../shared/domain/DomainError';
import { InMemoryChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../../change-viewer/domain/Change';
import { InMemoryAgentTaskScaffolder } from './ports/AgentTaskScaffolder';

function changesWith(...names: string[]): InMemoryChangeRepository {
  return new InMemoryChangeRepository(new Map([['/p', names.map((n) => Change.create(n, 'active'))]]));
}

describe('CreateWorktreeForChange', () => {
  it('creates a worktree branched change/<name> and scaffolds the agent task', async () => {
    const worktrees = new InMemoryWorktreeRepository();
    const scaffolder = new InMemoryAgentTaskScaffolder();

    const created = await new CreateWorktreeForChange(worktrees, changesWith('add-auth'), scaffolder).execute(
      '/p',
      'add-auth',
    );

    expect(created.path).toBe('/p/.claude/worktrees/add-auth');
    expect(created.branch.getOrThrow()).toBe('change/add-auth');
    expect(scaffolder.calls).toEqual([{ projectPath: '/p', worktreePath: created.path, changeName: 'add-auth' }]);
  });

  it('errors when the change does not exist in the project', async () => {
    const create = new CreateWorktreeForChange(
      new InMemoryWorktreeRepository(),
      changesWith('other'),
      new InMemoryAgentTaskScaffolder(),
    );

    await expect(create.execute('/p', 'add-auth')).rejects.toThrow(DomainError);
  });

  it('reports a conflict (and does not scaffold) when a worktree already exists', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create('/p/.claude/worktrees/add-auth', Maybe.some('change/add-auth'), false)]]]),
    );
    const scaffolder = new InMemoryAgentTaskScaffolder();

    await expect(
      new CreateWorktreeForChange(worktrees, changesWith('add-auth'), scaffolder).execute('/p', 'add-auth'),
    ).rejects.toMatchObject({ kind: 'conflict' });
    expect(scaffolder.calls).toEqual([]);
  });

  it('rejects an unsafe change name before touching the repository', async () => {
    const create = new CreateWorktreeForChange(
      new InMemoryWorktreeRepository(),
      changesWith('add-auth'),
      new InMemoryAgentTaskScaffolder(),
    );

    await expect(create.execute('/p', 'a b')).rejects.toMatchObject({ kind: 'validation' });
  });
});
