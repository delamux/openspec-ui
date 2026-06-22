import { Maybe } from '../../../shared/domain/Maybe';
import type { Worktree } from '../domain/Worktree';
import type { WorktreeRepository } from '../domain/repositories/WorktreeRepository';
import type { ChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { progress, type Progress } from '../../change-viewer/domain/TaskList';

export interface WorktreeOverview {
  worktree: Worktree;
  progress: Maybe<Progress>;
}

export class ListWorktrees {
  constructor(
    private readonly worktrees: WorktreeRepository,
    private readonly changes: ChangeRepository,
  ) {}

  async execute(projectPath: string): Promise<WorktreeOverview[]> {
    const list = await this.worktrees.list(projectPath);
    return Promise.all(list.map((worktree) => this.overview(worktree)));
  }

  private async overview(worktree: Worktree): Promise<WorktreeOverview> {
    const changeProgress = await worktree.changeName().fold(
      async () => Maybe.none<Progress>(),
      async (name) => this.progressFor(worktree.path, name),
    );
    return { worktree, progress: changeProgress };
  }

  private async progressFor(worktreePath: string, changeName: string): Promise<Maybe<Progress>> {
    try {
      const detail = await this.changes.loadChange(worktreePath, changeName);
      return detail.tasks.map(progress);
    } catch {
      return Maybe.none<Progress>();
    }
  }
}
