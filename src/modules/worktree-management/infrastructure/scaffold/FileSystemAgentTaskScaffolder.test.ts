import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileSystemAgentTaskScaffolder } from './FileSystemAgentTaskScaffolder';

async function exists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

describe('FileSystemAgentTaskScaffolder', () => {
  const scaffolder = new FileSystemAgentTaskScaffolder();
  let root: string;
  let project: string;
  let worktree: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'openspec-ui-scaffold-'));
    project = join(root, 'app');
    worktree = join(project, '.claude', 'worktrees', 'add-auth');
    await mkdir(join(project, '.claude', 'skills', 'openspec-apply-change'), { recursive: true });
    await writeFile(join(project, '.claude', 'skills', 'openspec-apply-change', 'SKILL.md'), '# skill\n');
    await mkdir(worktree, { recursive: true });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('copies the .claude skills into the worktree so the agent has the skill', async () => {
    await scaffolder.scaffold({ projectPath: project, worktreePath: worktree, changeName: 'add-auth' });

    expect(await exists(join(worktree, '.claude', 'skills', 'openspec-apply-change', 'SKILL.md'))).toBe(true);
  });

  it('writes a CLAUDE_TASK.md naming the change and the apply skill', async () => {
    await scaffolder.scaffold({ projectPath: project, worktreePath: worktree, changeName: 'add-auth' });

    const task = await readFile(join(worktree, 'CLAUDE_TASK.md'), 'utf8');
    expect(task).toContain('add-auth');
    expect(task).toContain('openspec-apply-change');
  });

  it('writes a VS Code folderOpen task that launches claude', async () => {
    await scaffolder.scaffold({ projectPath: project, worktreePath: worktree, changeName: 'add-auth' });

    const tasks = JSON.parse(await readFile(join(worktree, '.vscode', 'tasks.json'), 'utf8'));
    expect(tasks.tasks[0].command).toBe('claude');
    expect(tasks.tasks[0].runOptions.runOn).toBe('folderOpen');
  });

  it('still writes the task file when the project has no .claude assets', async () => {
    const bare = join(root, 'bare');
    const bareWorktree = join(bare, '.claude', 'worktrees', 'x');
    await mkdir(bareWorktree, { recursive: true });

    await scaffolder.scaffold({ projectPath: bare, worktreePath: bareWorktree, changeName: 'x' });

    expect(await exists(join(bareWorktree, 'CLAUDE_TASK.md'))).toBe(true);
  });
});
