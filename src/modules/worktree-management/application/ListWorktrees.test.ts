import { describe, it, expect } from 'vitest';
import { ListWorktrees } from './ListWorktrees';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { Worktree } from '../domain/Worktree';
import { Maybe } from '../../../shared/domain/Maybe';
import {
  InMemoryChangeRepository,
} from '../../change-viewer/domain/repositories/ChangeRepository';
import type { ChangeDetail } from '../../change-viewer/domain/ChangeDetail';

const wtPath = '/p/.claude/worktrees/add-auth';

function detailWith(done: number, total: number): ChangeDetail {
  const items = Array.from({ length: total }, (_, i) => ({
    id: `1.${i + 1}`,
    text: `task ${i + 1}`,
    done: i < done,
    comments: [],
  }));
  return { proposal: Maybe.none(), design: Maybe.none(), tasks: Maybe.some([{ title: '1. Work', items }]) };
}

describe('ListWorktrees', () => {
  it('lists worktrees and reports the live change progress from the worktree copy', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([
        [
          '/p',
          [Worktree.create('/p', Maybe.some('main'), true), Worktree.create(wtPath, Maybe.some('change/add-auth'), false)],
        ],
      ]),
    );
    const changes = new InMemoryChangeRepository(new Map(), new Map([[`${wtPath}::add-auth`, detailWith(1, 2)]]));

    const overviews = await new ListWorktrees(worktrees, changes).execute('/p');

    const addAuth = overviews.find((o) => o.worktree.path === wtPath)!;
    expect(addAuth.progress.getOrThrow()).toEqual({ done: 1, total: 2, pct: 50 });
  });

  it('reports no progress for the main checkout (no change branch)', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create('/p', Maybe.some('main'), true)]]]),
    );

    const overviews = await new ListWorktrees(worktrees, new InMemoryChangeRepository()).execute('/p');

    expect(overviews[0].progress.isNone()).toBe(true);
  });

  it('lists a worktree even when its change copy is absent', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const overviews = await new ListWorktrees(worktrees, new InMemoryChangeRepository()).execute('/p');

    expect(overviews).toHaveLength(1);
    expect(overviews[0].progress.isNone()).toBe(true);
  });
});
