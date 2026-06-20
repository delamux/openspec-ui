import { DomainError } from '../../../shared/domain/DomainError';
import type { Worktree } from '../domain/Worktree';
import { WorktreeName } from '../domain/WorktreeName';
import { BranchName } from '../domain/BranchName';
import { worktreePath, type WorktreeRepository } from '../domain/repositories/WorktreeRepository';
import type { ChangeRepository } from '../../change-viewer/domain/repositories/ChangeRepository';
import type { AgentTaskScaffolder } from './ports/AgentTaskScaffolder';

export class CreateWorktreeForChange {
  constructor(
    private readonly worktrees: WorktreeRepository,
    private readonly changes: ChangeRepository,
    private readonly scaffolder: AgentTaskScaffolder,
  ) {}

  async execute(projectPath: string, changeName: string): Promise<Worktree> {
    const name = WorktreeName.create(changeName);
    const branch = BranchName.forChange(changeName);
    await this.ensureChangeExists(projectPath, changeName);
    await this.ensureNoExistingWorktree(projectPath, name);
    const created = await this.worktrees.create(projectPath, name, branch);
    await this.scaffolder.scaffold({ projectPath, worktreePath: created.path, changeName });
    return created;
  }

  private async ensureChangeExists(projectPath: string, changeName: string): Promise<void> {
    const changes = await this.changes.listChanges(projectPath);
    if (!changes.some((change) => change.name === changeName)) {
      throw DomainError.createNotFound(`No change named "${changeName}" in this project`);
    }
  }

  private async ensureNoExistingWorktree(projectPath: string, name: WorktreeName): Promise<void> {
    const target = worktreePath(projectPath, name);
    const existing = await this.worktrees.list(projectPath);
    if (existing.some((worktree) => worktree.path === target)) {
      throw DomainError.createConflict(`A worktree already exists at "${target}"`);
    }
  }
}
