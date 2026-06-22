import type { AgentActivity } from '../domain/AgentActivity';
import type { WorktreeRepository } from '../domain/repositories/WorktreeRepository';
import type { AgentActivityProvider } from '../domain/repositories/AgentActivityProvider';

export interface WorktreeActivityItem {
  path: string;
  activity: AgentActivity;
}

export class GetWorktreesActivity {
  constructor(
    private readonly worktrees: WorktreeRepository,
    private readonly provider: AgentActivityProvider,
  ) {}

  async execute(projectPath: string): Promise<WorktreeActivityItem[]> {
    const list = await this.worktrees.list(projectPath);
    return Promise.all(
      list.map(async (worktree) => ({
        path: worktree.path,
        activity: await this.provider.activityFor(worktree.path),
      })),
    );
  }
}
