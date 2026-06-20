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

  it('adds a change that only exists in a worktree, labeled by its worktree', async () => {
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
      `new-idea@${wtPath}`,
    ]);
    expect(result[1].worktreeName.getOrThrow()).toBe('add-auth');
  });

  it('does not duplicate a worktree copy of a change that already exists on main', async () => {
    const changes = changesAt([
      ['/p', [Change.create('add-auth', 'active')]],
      [wtPath, [Change.create('add-auth', 'active')]],
    ]);
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result).toHaveLength(1);
    expect(result[0].sourcePath).toBe('/p');
  });
});
