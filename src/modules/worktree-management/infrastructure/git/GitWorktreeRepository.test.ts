import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GitWorktreeRepository } from './GitWorktreeRepository';
import { WorktreeName } from '../../domain/WorktreeName';
import { BranchName } from '../../domain/BranchName';
import { DomainError } from '../../../../shared/domain/DomainError';

const run = promisify(execFile);

async function git(cwd: string, ...args: string[]): Promise<void> {
  await run('git', args, { cwd });
}

async function initRepo(): Promise<string> {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'openspec-ui-wt-')));
  await git(dir, 'init', '-q');
  await git(dir, 'config', 'user.email', 'test@example.com');
  await git(dir, 'config', 'user.name', 'Test');
  await git(dir, 'commit', '--allow-empty', '-q', '-m', 'init');
  return dir;
}

describe('GitWorktreeRepository', () => {
  const repository = new GitWorktreeRepository();
  let project: string;

  beforeEach(async () => {
    project = await initRepo();
  });

  afterEach(async () => {
    await rm(project, { recursive: true, force: true });
  });

  it('lists only the main checkout for a fresh repo', async () => {
    const worktrees = await repository.list(project);

    expect(worktrees).toHaveLength(1);
    expect(worktrees[0].isMain).toBe(true);
  });

  it('creates a worktree for a change under .claude/worktrees and lists it', async () => {
    const created = await repository.create(project, WorktreeName.create('add-auth'), BranchName.forChange('add-auth'));

    expect(created.path).toBe(join(project, '.claude', 'worktrees', 'add-auth'));
    expect(created.branch.getOrThrow()).toBe('change/add-auth');

    const worktrees = await repository.list(project);
    const added = worktrees.find((w) => w.path === created.path)!;
    expect(added.isMain).toBe(false);
    expect(added.branch.getOrThrow()).toBe('change/add-auth');
  });

  it('attaches an existing branch instead of creating it', async () => {
    await git(project, 'branch', 'change/ready');

    const created = await repository.create(project, WorktreeName.create('ready'), BranchName.forChange('ready'));

    expect(created.branch.getOrThrow()).toBe('change/ready');
  });

  it('removes a worktree', async () => {
    const created = await repository.create(project, WorktreeName.create('add-auth'), BranchName.forChange('add-auth'));

    await repository.remove(project, created.path);

    expect(await repository.list(project)).toHaveLength(1);
  });

  it('surfaces a non-git directory as a domain error', async () => {
    const plain = await realpath(await mkdtemp(join(tmpdir(), 'openspec-ui-plain-')));
    try {
      await expect(repository.list(plain)).rejects.toThrow(DomainError);
    } finally {
      await rm(plain, { recursive: true, force: true });
    }
  });
});
