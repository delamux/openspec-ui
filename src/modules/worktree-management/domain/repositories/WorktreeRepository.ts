import { join } from 'node:path';
import { Maybe } from '../../../../shared/domain/Maybe';
import { DomainError } from '../../../../shared/domain/DomainError';
import { Worktree } from '../Worktree';
import type { WorktreeName } from '../WorktreeName';
import type { BranchName } from '../BranchName';

export interface WorktreeRepository {
  list(projectPath: string): Promise<Worktree[]>;
  create(projectPath: string, name: WorktreeName, branch: BranchName): Promise<Worktree>;
  remove(projectPath: string, worktreePath: string): Promise<void>;
}

export function worktreePath(projectPath: string, name: WorktreeName): string {
  return join(projectPath, '.claude', 'worktrees', name.value);
}

export class InMemoryWorktreeRepository implements WorktreeRepository {
  constructor(private readonly byProject: Map<string, Worktree[]> = new Map()) {}

  async list(projectPath: string): Promise<Worktree[]> {
    return this.byProject.get(projectPath) ?? [];
  }

  async create(projectPath: string, name: WorktreeName, branch: BranchName): Promise<Worktree> {
    const path = worktreePath(projectPath, name);
    const existing = this.byProject.get(projectPath) ?? [];
    if (existing.some((worktree) => worktree.path === path)) {
      throw DomainError.createConflict(`A worktree already exists at "${path}"`);
    }
    const created = Worktree.create(path, Maybe.some(branch.value), false);
    this.byProject.set(projectPath, [...existing, created]);
    return created;
  }

  async remove(projectPath: string, targetPath: string): Promise<void> {
    const existing = this.byProject.get(projectPath) ?? [];
    this.byProject.set(
      projectPath,
      existing.filter((worktree) => worktree.path !== targetPath),
    );
  }
}
