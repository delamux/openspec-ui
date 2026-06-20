import { Maybe } from '../../../shared/domain/Maybe';
import type { Change, ChangeStatus } from '../../change-viewer/domain/Change';
import type { ChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import type { WorktreeRepository } from '../domain/repositories/WorktreeRepository';

export interface SelectableChange {
  name: string;
  status: ChangeStatus;
  sourcePath: string;
  worktreeName: Maybe<string>;
}

export class ListSelectableChanges {
  constructor(
    private readonly changes: ChangeRepository,
    private readonly worktrees: WorktreeRepository,
  ) {}

  async execute(projectPath: string): Promise<SelectableChange[]> {
    const mainChanges = await this.changes.listChanges(projectPath);
    const selectable: SelectableChange[] = mainChanges.map((change) => ({
      name: change.name,
      status: change.status,
      sourcePath: projectPath,
      worktreeName: Maybe.none<string>(),
    }));

    const worktrees = (await this.worktrees.list(projectPath)).filter((worktree) => !worktree.isMain);
    for (const worktree of worktrees) {
      const leaf = leafName(worktree.path);
      const worktreeChanges = await this.listSafely(worktree.path);
      for (const change of worktreeChanges) {
        // Worktrees are for active work — skip archived (done) changes to keep the picker focused.
        if (change.isArchived()) {
          continue;
        }
        selectable.push({
          name: change.name,
          status: change.status,
          sourcePath: worktree.path,
          worktreeName: Maybe.some(leaf),
        });
      }
    }
    return selectable;
  }

  private async listSafely(path: string): Promise<Change[]> {
    try {
      return await this.changes.listChanges(path);
    } catch {
      return [];
    }
  }
}

function leafName(path: string): string {
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return segments[segments.length - 1] ?? '';
}
