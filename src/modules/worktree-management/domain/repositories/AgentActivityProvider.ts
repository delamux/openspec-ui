import { noSessionActivity, type AgentActivity } from '../AgentActivity';

export interface AgentActivityProvider {
  activityFor(worktreePath: string): Promise<AgentActivity>;
}

export class InMemoryAgentActivityProvider implements AgentActivityProvider {
  constructor(private readonly byPath: Map<string, AgentActivity> = new Map()) {}

  async activityFor(worktreePath: string): Promise<AgentActivity> {
    return this.byPath.get(worktreePath) ?? noSessionActivity();
  }
}
