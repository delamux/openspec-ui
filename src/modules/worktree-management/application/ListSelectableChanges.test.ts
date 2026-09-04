import { describe, it, expect } from 'vitest';
import { ListSelectableChanges } from './ListSelectableChanges';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { Worktree } from '../domain/Worktree';
import { Maybe } from '../../../shared/domain/Maybe';
import { InMemoryChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { Change } from '../../change-viewer/domain/Change';
import type { ChangeDetail } from '../../change-viewer/domain/ChangeDetail';

const wtPath = '/p/.claude/worktrees/add-auth';

function changesAt(entries: [string, Change[]][], details: [string, ChangeDetail][] = []): InMemoryChangeRepository {
  return new InMemoryChangeRepository(new Map(entries), new Map(details));
}

function detailWithTasks(done: boolean[]): ChangeDetail {
  return {
    proposal: Maybe.none<string>(),
    design: Maybe.none<string>(),
    tasks: Maybe.some([
      {
        title: '1. Group',
        items: done.map((isDone, index) => ({
          id: `1.${index + 1}`,
          text: `task ${index + 1}`,
          done: isDone,
          comments: [],
        })),
      },
    ]),
  };
}

describe('ListSelectableChanges', () => {
  it('returns the main changes loaded from the project path', async () => {
    const changes = changesAt([['/p', [Change.create('add-auth', 'active')]]]);
    const worktrees = new InMemoryWorktreeRepository(new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true)]]]));

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result).toEqual([
      { name: 'add-auth', status: 'active', sourcePath: '/p', worktreeName: Maybe.none(), progress: Maybe.none() },
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

  it('lists archived changes after every active one', async () => {
    const changes = changesAt([
      [
        '/p',
        [Change.create('old-idea', 'archived'), Change.create('add-auth', 'active'), Change.create('add-cache', 'active')],
      ],
    ]);
    const worktrees = new InMemoryWorktreeRepository(new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true)]]]));

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result.map((c) => c.name)).toEqual(['add-auth', 'add-cache', 'old-idea']);
  });

  it('lists a worktree change before an archived main change', async () => {
    const changes = changesAt([
      ['/p', [Change.create('old-idea', 'archived')]],
      [wtPath, [Change.create('new-idea', 'active')]],
    ]);
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/new-idea'), false)]]]),
    );

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result.map((c) => c.name)).toEqual(['new-idea', 'old-idea']);
  });

  it('reports the task progress of every change', async () => {
    const changes = changesAt(
      [['/p', [Change.create('add-auth', 'active')]]],
      [['/p::add-auth', detailWithTasks([true, false, false])]],
    );
    const worktrees = new InMemoryWorktreeRepository(new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true)]]]));

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result[0].progress.getOrThrow()).toEqual({ done: 1, total: 3, pct: 33 });
  });

  it('reports no progress for a change without a task list', async () => {
    const changes = changesAt([['/p', [Change.create('add-auth', 'active')]]]);
    const worktrees = new InMemoryWorktreeRepository(new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true)]]]));

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result[0].progress.isNone()).toBe(true);
  });

  it('reads the progress of a worktree change from the worktree copy', async () => {
    const changes = changesAt(
      [
        ['/p', [Change.create('add-auth', 'active')]],
        [wtPath, [Change.create('add-auth', 'active')]],
      ],
      [
        ['/p::add-auth', detailWithTasks([false, false])],
        [`${wtPath}::add-auth`, detailWithTasks([true, true])],
      ],
    );
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const result = await new ListSelectableChanges(changes, worktrees).execute('/p');

    expect(result[0].progress.getOrThrow().done).toBe(0);
    expect(result[1].progress.getOrThrow().done).toBe(2);
  });
});
