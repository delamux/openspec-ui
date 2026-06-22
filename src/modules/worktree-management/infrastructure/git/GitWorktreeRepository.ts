import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Maybe } from '../../../../shared/domain/Maybe';
import { DomainError } from '../../../../shared/domain/DomainError';
import { Worktree } from '../../domain/Worktree';
import { worktreePath, type WorktreeRepository } from '../../domain/repositories/WorktreeRepository';
import type { WorktreeName } from '../../domain/WorktreeName';
import type { BranchName } from '../../domain/BranchName';

const run = promisify(execFile);

interface ParsedWorktree {
  path: string;
  branch: Maybe<string>;
  bare: boolean;
}

export class GitWorktreeRepository implements WorktreeRepository {
  async list(projectPath: string): Promise<Worktree[]> {
    const out = await this.git(projectPath, ['worktree', 'list', '--porcelain'], `read the worktrees of "${projectPath}"`);
    return this.toWorktrees(projectPath, parsePorcelain(out));
  }

  async create(projectPath: string, name: WorktreeName, branch: BranchName): Promise<Worktree> {
    const path = worktreePath(projectPath, name);
    const args = (await this.branchExists(projectPath, branch))
      ? ['worktree', 'add', path, branch.value]
      : ['worktree', 'add', '-b', branch.value, path];
    await this.git(projectPath, args, `create a worktree for "${branch.value}"`);
    return Worktree.create(path, Maybe.some(branch.value), false);
  }

  async remove(projectPath: string, targetPath: string): Promise<void> {
    await this.git(projectPath, ['worktree', 'remove', '--force', targetPath], `remove the worktree at "${targetPath}"`);
  }

  private toWorktrees(projectPath: string, parsed: ParsedWorktree[]): Worktree[] {
    const worktreesRoot = `${projectPath}/.claude/worktrees/`;
    return parsed
      .map((record, index) => ({ record, isMain: index === 0 }))
      .filter(({ record }) => !record.bare && record.path.length > 0)
      .filter(({ record, isMain }) => isMain || record.path.startsWith(worktreesRoot))
      .map(({ record, isMain }) => Worktree.create(record.path, record.branch, isMain));
  }

  private async branchExists(projectPath: string, branch: BranchName): Promise<boolean> {
    try {
      await run('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branch.value}`], { cwd: projectPath });
      return true;
    } catch {
      return false;
    }
  }

  private async git(projectPath: string, args: string[], action: string): Promise<string> {
    try {
      const { stdout } = await run('git', args, { cwd: projectPath });
      return stdout;
    } catch {
      throw DomainError.create(`Could not ${action} (is it a git repository?)`);
    }
  }
}

function parsePorcelain(porcelain: string): ParsedWorktree[] {
  const records: ParsedWorktree[] = [];
  let current: ParsedWorktree | null = null;
  for (const raw of porcelain.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('worktree ')) {
      if (current !== null) {
        records.push(current);
      }
      current = { path: line.slice('worktree '.length).trim(), branch: Maybe.none<string>(), bare: false };
      continue;
    }
    if (current === null) {
      continue;
    }
    if (line.startsWith('branch ')) {
      current.branch = Maybe.some(line.slice('branch '.length).replace('refs/heads/', '').trim());
    }
    if (line === 'bare') {
      current.bare = true;
    }
  }
  if (current !== null) {
    records.push(current);
  }
  return records;
}
