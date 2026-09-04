import { Maybe } from '../../../shared/domain/Maybe';
import type { Change, ChangeStatus } from '../../change-viewer/domain/Change';
import type { ChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { progress, type Progress } from '../../change-viewer/domain/TaskList';
import type { WorktreeRepository } from '../domain/repositories/WorktreeRepository';

export interface SelectableChange {
  name: string;
  status: ChangeStatus;
  sourcePath: string;
  worktreeName: Maybe<string>;
  progress: Maybe<Progress>;
}

type Candidate = Omit<SelectableChange, 'progress'>;

export class ListSelectableChanges {
  constructor(
    private readonly changes: ChangeRepository,
    private readonly worktrees: WorktreeRepository,
  ) {}

  async execute(projectPath: string): Promise<SelectableChange[]> {
    const candidates = [
      ...(await this.mainCandidates(projectPath)),
      ...(await this.worktreeCandidates(projectPath)),
    ];
    const selectable = await Promise.all(candidates.map((candidate) => this.withProgress(candidate)));
    return archivedLast(selectable);
  }

  private async mainCandidates(projectPath: string): Promise<Candidate[]> {
    const changes = await this.changes.listChanges(projectPath);
    return changes.map((change) => ({
      name: change.name,
      status: change.status,
      sourcePath: projectPath,
      worktreeName: Maybe.none<string>(),
    }));
  }

  private async worktreeCandidates(projectPath: string): Promise<Candidate[]> {
    const worktrees = (await this.worktrees.list(projectPath)).filter((worktree) => !worktree.isMain);
    const perWorktree = await Promise.all(worktrees.map((worktree) => this.candidatesIn(worktree.path)));
    return perWorktree.flat();
  }

  private async candidatesIn(worktreePath: string): Promise<Candidate[]> {
    const changes = await this.listSafely(worktreePath);
    // Worktrees are for active work — skip archived (done) changes to keep the picker focused.
    return changes
      .filter((change) => !change.isArchived())
      .map((change) => ({
        name: change.name,
        status: change.status,
        sourcePath: worktreePath,
        worktreeName: Maybe.some(leafName(worktreePath)),
      }));
  }

  private async withProgress(candidate: Candidate): Promise<SelectableChange> {
    return { ...candidate, progress: await this.progressOf(candidate) };
  }

  private async progressOf(candidate: Candidate): Promise<Maybe<Progress>> {
    try {
      const detail = await this.changes.loadChange(candidate.sourcePath, candidate.name);
      return detail.tasks.map(progress);
    } catch {
      return Maybe.none<Progress>();
    }
  }

  private async listSafely(path: string): Promise<Change[]> {
    try {
      return await this.changes.listChanges(path);
    } catch {
      return [];
    }
  }
}

// Archived changes are the long tail of the picker, so they never push the live work down.
function archivedLast(changes: SelectableChange[]): SelectableChange[] {
  return [
    ...changes.filter((change) => change.status !== 'archived'),
    ...changes.filter((change) => change.status === 'archived'),
  ];
}

function leafName(path: string): string {
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return segments[segments.length - 1] ?? '';
}
