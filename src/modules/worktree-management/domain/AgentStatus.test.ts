import { describe, it, expect } from 'vitest';
import { AgentStatus } from './AgentStatus';

describe('AgentStatus', () => {
  it('treats working, thinking, and waiting as active', () => {
    expect(AgentStatus.fromKind('working').isActive()).toBe(true);
    expect(AgentStatus.fromKind('thinking').isActive()).toBe(true);
    expect(AgentStatus.fromKind('waiting').isActive()).toBe(true);
  });

  it('treats done and idle as not active', () => {
    expect(AgentStatus.fromKind('done').isActive()).toBe(false);
    expect(AgentStatus.fromKind('idle').isActive()).toBe(false);
  });

  it('exposes a no-session status', () => {
    expect(AgentStatus.noSession().isNoSession()).toBe(true);
    expect(AgentStatus.noSession().isActive()).toBe(false);
  });
});
