import { Maybe } from '../../../shared/domain/Maybe';
import type { Change, ChangeStatus } from '../../change-viewer/domain/Change';
import type { ChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import { progress, type Progress } from '../../change-viewer/domain/TaskList';
import type { Worktree } from '../domain/Worktree';
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
    const main = await this.mainCandidates(projectPath);
    const candidates = [...main, ...(await this.worktreeCandidates(projectPath, namesOf(main)))];
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

  private async worktreeCandidates(projectPath: string, mainNames: Set<string>): Promise<Candidate[]> {
    const worktrees = (await this.worktrees.list(projectPath)).filter((worktree) => !worktree.isMain);
    const perWorktree = await Promise.all(worktrees.map((worktree) => this.candidatesIn(worktree, mainNames)));
    return perWorktree.flat();
  }

  private async candidatesIn(worktree: Worktree, mainNames: Set<string>): Promise<Candidate[]> {
    const changes = await this.listSafely(worktree.path);
    // A worktree is a full checkout, so it contains every main change. Keep the
    // change this worktree is for (the live copy) plus changes that exist only here.
    return changes
      .filter((change) => !change.isArchived())
      .filter((change) => belongsInWorktreePicker(worktree, change.name, mainNames))
      .map((change) => ({
        name: change.name,
        status: change.status,
        sourcePath: worktree.path,
        worktreeName: Maybe.some(leafName(worktree.path)),
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

function belongsInWorktreePicker(worktree: Worktree, name: string, mainNames: Set<string>): boolean {
  if (worktree.changeName().fold(() => false, (own) => own === name)) {
    return true;
  }
  return !mainNames.has(name);
}

function namesOf(candidates: Candidate[]): Set<string> {
  return new Set(candidates.map((candidate) => candidate.name));
}

function leafName(path: string): string {
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return segments[segments.length - 1] ?? '';
}
