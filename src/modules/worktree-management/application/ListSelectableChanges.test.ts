import { describe, it, expect } from 'vitest';
import { ListSelectableChanges } from './ListSelectableChanges';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { Worktree } from '../domain/Worktree';
import { Maybe } from '../../../shared/domain/Maybe';
import { InMemoryChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../../change-viewer/domain/Change';

const wtPath = '/p/.claude/worktrees/add-auth';

function changesAt(entries: [string, Change[]][]): InMemoryChangeRepository {
  return new InMemoryChangeRepository(new Map(entries));
}

describe('ListSelectableChanges', () => {
  it('returns the main changes loaded from the project path', async () => {
    const changes = changesAt([['/p', [Change.create('add-auth', 'active')]]]);
    const worktrees = new InMemoryWorktreeRepository(new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true)]]]));

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result).toEqual([
      { name: 'add-auth', status: 'active', sourcePath: '/p', worktreeName: Maybe.none() },
    ]);
  });

  it('lists every worktree change labeled by its worktree, plus a worktree-only change', async () => {
    const changes = changesAt([
      ['/p', [Change.create('add-auth', 'active')]],
      [wtPath, [Change.create('add-auth', 'active'), Change.create('new-idea', 'active')]],
    ]);
    const worktrees = new InMemoryWorktreeRepository(
      new Map([
        ['/p', [Worktree.create('/p', Maybe.some('main'), true), Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]],
      ]),
    );

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result.map((c) => `${c.name}@${c.sourcePath}`)).toEqual([
      'add-auth@/p',
      `add-auth@${wtPath}`,
      `new-idea@${wtPath}`,
    ]);
    expect(result[1].worktreeName.getOrThrow()).toBe('add-auth');
  });

  it('includes the worktree copy of a change that also exists on main (so the live copy is selectable)', async () => {
    const changes = changesAt([
      ['/p', [Change.create('add-auth', 'active')]],
      [wtPath, [Change.create('add-auth', 'active')]],
    ]);
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result.map((c) => c.sourcePath)).toEqual(['/p', wtPath]);
  });
});
