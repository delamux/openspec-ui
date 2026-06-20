import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ClaudeSessionActivityProvider } from './ClaudeSessionActivityProvider';
import { encodeWorktreePath } from './sessionPath';

const NOW = 1_000_000_000_000;
const worktree = '/home/me/code/app/.claude/worktrees/add-auth';

async function seedSession(projectsRoot: string, lines: string[]): Promise<string> {
  const dir = join(projectsRoot, encodeWorktreePath(worktree));
  await mkdir(dir, { recursive: true });
  const file = join(dir, 'session.jsonl');
  await writeFile(file, lines.join('\n'), 'utf8');
  return file;
}

describe('ClaudeSessionActivityProvider', () => {
  let projectsRoot: string;
  const provider = () => new ClaudeSessionActivityProvider(projectsRoot, () => NOW);

  beforeEach(async () => {
    projectsRoot = await mkdtemp(join(tmpdir(), 'openspec-ui-sessions-'));
  });

  afterEach(async () => {
    await rm(projectsRoot, { recursive: true, force: true });
  });

  it('derives status from the worktree session log', async () => {
    await seedSession(projectsRoot, [
      JSON.stringify({
        type: 'assistant',
        timestamp: new Date(NOW - 10_000).toISOString(),
        message: { content: [{ type: 'tool_use', name: 'Edit', input: { file_path: '/x.ts' } }] },
      }),
    ]);

    const activity = await provider().activityFor(worktree);

    expect(activity.status.kind).toBe('working');
    expect(activity.lastTool.getOrThrow()).toBe('Edit');
  });

  it('reports no-session when the worktree has no session directory', async () => {
    const activity = await provider().activityFor('/home/me/code/app/.claude/worktrees/ghost');

    expect(activity.status.isNoSession()).toBe(true);
  });

  it('reads without modifying the log (safe to poll)', async () => {
    const file = await seedSession(projectsRoot, [
      JSON.stringify({ type: 'assistant', timestamp: new Date(NOW - 10_000).toISOString(), message: { content: [] } }),
    ]);
    const before = await readFile(file, 'utf8');

    await provider().activityFor(worktree);
    await provider().activityFor(worktree);

    expect(await readFile(file, 'utf8')).toBe(before);
  });
});
