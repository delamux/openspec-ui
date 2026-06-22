import { describe, it, expect } from 'vitest';
import { InMemoryWorktreeRepository, worktreePath } from './WorktreeRepository';
import { WorktreeName } from '../WorktreeName';
import { BranchName } from '../BranchName';
import { DomainError } from '../../../../shared/domain/DomainError';

describe('InMemoryWorktreeRepository', () => {
  it('creates a worktree at .claude/worktrees/<name> on the given branch', async () => {
    const repo = new InMemoryWorktreeRepository();

    const created = await repo.create('/p', WorktreeName.create('add-auth'), BranchName.forChange('add-auth'));

    expect(created.path).toBe(worktreePath('/p', WorktreeName.create('add-auth')));
    expect(created.branch.getOrThrow()).toBe('change/add-auth');
    expect((await repo.list('/p')).map((w) => w.path)).toContain(created.path);
  });

  it('rejects creating a second worktree at the same path', async () => {
    const repo = new InMemoryWorktreeRepository();
    await repo.create('/p', WorktreeName.create('add-auth'), BranchName.forChange('add-auth'));

    await expect(
      repo.create('/p', WorktreeName.create('add-auth'), BranchName.forChange('add-auth')),
    ).rejects.toThrow(DomainError);
  });

  it('removes a worktree by path', async () => {
    const repo = new InMemoryWorktreeRepository();
    const created = await repo.create('/p', WorktreeName.create('add-auth'), BranchName.forChange('add-auth'));

    await repo.remove('/p', created.path);

    expect(await repo.list('/p')).toEqual([]);
  });
});
