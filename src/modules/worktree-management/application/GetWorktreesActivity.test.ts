import { describe, it, expect } from 'vitest';
import { GetWorktreesActivity } from './GetWorktreesActivity';
import { InMemoryWorktreeRepository } from '../domain/repositories/WorktreeRepository';
import { InMemoryAgentActivityProvider } from '../domain/repositories/AgentActivityProvider';
import { Worktree } from '../domain/Worktree';
import { AgentStatus } from '../domain/AgentStatus';
import { noSessionActivity } from '../domain/AgentActivity';
import { Maybe } from '../../../shared/domain/Maybe';

const wtPath = '/p/.claude/worktrees/add-auth';

describe('GetWorktreesActivity', () => {
  it('returns the live activity for each worktree', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );
    const provider = new InMemoryAgentActivityProvider(
      new Map([[wtPath, { ...noSessionActivity(), status: AgentStatus.fromKind('working') }]]),
    );

    const items = await new GetWorktreesActivity(worktrees, provider).execute('/p');

    expect(items).toEqual([{ path: wtPath, activity: expect.objectContaining({ status: expect.anything() }) }]);
    expect(items[0].activity.status.kind).toBe('working');
  });

  it('reports no-session for a worktree with no agent session', async () => {
    const worktrees = new InMemoryWorktreeRepository(
      new Map([['/p', [Worktree.create(wtPath, Maybe.some('change/add-auth'), false)]]]),
    );

    const items = await new GetWorktreesActivity(worktrees, new InMemoryAgentActivityProvider()).execute('/p');

    expect(items[0].activity.status.isNoSession()).toBe(true);
  });
});
