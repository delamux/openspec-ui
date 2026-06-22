import { describe, it, expect } from 'vitest';
import { RemoveWorktree } from './RemoveWorktree';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { Worktree } from '../domain/Worktree';
import { Maybe } from '../../../shared/domain/Maybe';

const wtPath = '/p/.claude/worktrees/add-auth';

function repoWithMainAnd(extra: Worktree[]): InMemoryWorktreeRepository {
  return new InMemoryWorktreeRepository(
    new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true), ...extra]]]),
  );
}

describe('RemoveWorktree', () => {
  it('removes a non-main worktree', async () => {
    const worktrees = repoWithMainAnd([Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]);

    await new RemoveWorktree(worktrees).execute('/p', wtPath);

    expect((await worktrees.list('/p')).map((w) => w.path)).toEqual(['/p']);
  });

  it('refuses to remove the main checkout', async () => {
    const worktrees = repoWithMainAnd([]);

    await expect(new RemoveWorktree(worktrees).execute('/p', '/p')).rejects.toMatchObject({ kind: 'validation' });
  });

  it('errors when removing an unknown worktree', async () => {
    const worktrees = repoWithMainAnd([]);

    await expect(new RemoveWorktree(worktrees).execute('/p', '/p/ghost')).rejects.toMatchObject({ kind: 'not-found' });
  });
});
