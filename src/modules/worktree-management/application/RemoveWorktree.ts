import { DomainError } from '../../../shared/domain/DomainError';
import type { WorktreeRepository } from '../domain/repositories/WorktreeRepository';

export class RemoveWorktree {
  constructor(private readonly worktrees: WorktreeRepository) {}

  async execute(projectPath: string, worktreePath: string): Promise<void> {
    const list = await this.worktrees.list(projectPath);
    const target = list.find((worktree) => worktree.path === worktreePath);
    if (target === undefined) {
      throw DomainError.createNotFound(`No worktree at "${worktreePath}"`);
    }
    target.ensureRemovable();
    await this.worktrees.remove(projectPath, worktreePath);
  }
}
