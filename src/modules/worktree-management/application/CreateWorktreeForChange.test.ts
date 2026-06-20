import { describe, it, expect } from 'vitest';
import { CreateWorktreeForChange } from './CreateWorktreeForChange';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { Worktree } from '../domain/Worktree';
import { Maybe } from '../../../shared/domain/Maybe';
import { DomainError } from '../../../shared/domain/DomainError';
import { InMemoryChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../../change-viewer/domain/Change';

function changesWith(...names: string[]): InMemoryChangeRepository {
  return new InMemoryChangeRepository(new Map([['/p', names.map((n) => Change.create(n, 'active'))]]));
}

describe('CreateWorktreeForChange', () => {
  it('creates a worktree branched change/<name> for an existing change', async () => {
    const worktrees = new InMemoryWorktreeRepository();

    const created = await new CreateWorktreeForChange(worktrees, changesWith('add-auth')).execute('/p', 'add-auth');

    expect(created.path).toBe('/p/.claude/worktrees/add-auth');
    expect(created.branch.getOrThrow()).toBe('change/add-auth');
  });

  it('errors when the change does not exist in the project', async () => {
    const create = new CreateWorktreeForChange(new InMemoryWorktreeRepository(), changesWith('other'));

    await expect(create.execute('/p', 'add-auth')).rejects.toThrow(DomainError);
  });

  it('reports a conflict when a worktree already exists for the change', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create('/p/.claude/worktrees/add-auth', Maybe.some('change/add-auth'), false)]]]),
    );

    await expect(
      new CreateWorktreeForChange(worktrees, changesWith('add-auth')).execute('/p', 'add-auth'),
    ).rejects.toMatchObject({ kind: 'conflict' });
  });

  it('rejects an unsafe change name before touching the repository', async () => {
    const create = new CreateWorktreeForChange(new InMemoryWorktreeRepository(), changesWith('add-auth'));

    await expect(create.execute('/p', 'a b')).rejects.toMatchObject({ kind: 'validation' });
  });
});
