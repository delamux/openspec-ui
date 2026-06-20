import { describe, it, expect } from 'vitest';
import { InMemoryAgentActivityProvider } from './AgentActivityProvider';
import { AgentStatus } from '../AgentStatus';
import { noSessionActivity } from '../AgentActivity';
import { Maybe } from '../../../../shared/domain/Maybe';

describe('InMemoryAgentActivityProvider', () => {
  it('returns the seeded activity for a known worktree path', async () => {
    const activity = { ...noSessionActivity(), status: AgentStatus.fromKind('working'), lastTool: Maybe.some('Edit') };
    const provider = new InMemoryAgentActivityProvider(new Map([['/p/wt', activity]]));

    const result = await provider.activityFor('/p/wt');

    expect(result.status.kind).toBe('working');
    expect(result.lastTool.getOrThrow()).toBe('Edit');
  });

  it('reports no-session for an unknown worktree path', async () => {
    const result = await new InMemoryAgentActivityProvider().activityFor('/p/unknown');

    expect(result.status.isNoSession()).toBe(true);
  });
});
