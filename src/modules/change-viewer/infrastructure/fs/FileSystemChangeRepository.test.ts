import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileSystemChangeRepository } from './FileSystemChangeRepository';
import { DomainError } from '../../../../shared/domain/DomainError';

async function makeChange(projectPath: string, name: string, archived = false, withProposal = true): Promise<string> {
  const dir = archived
    ? join(projectPath, 'openspec', 'changes', 'archive', name)
    : join(projectPath, 'openspec', 'changes', name);
  await mkdir(dir, { recursive: true });
  if (withProposal) {
    await writeFile(join(dir, 'proposal.md'), `# ${name}\n`, 'utf8');
  }
  return dir;
}

describe('FileSystemChangeRepository', () => {
  const repository = new FileSystemChangeRepository();
  let project: string;

  beforeEach(async () => {
    project = await mkdtemp(join(tmpdir(), 'openspec-ui-changes-'));
  });

  afterEach(async () => {
    await rm(project, { recursive: true, force: true });
  });

  it('lists active and archived changes, flagging archived', async () => {
    await makeChange(project, 'add-auth');
    await makeChange(project, '2026-06-04-old-thing', true);

    const changes = await repository.listChanges(project);

    expect(changes.map((c) => `${c.name}:${c.status}`)).toEqual([
      'add-auth:active',
      '2026-06-04-old-thing:archived',
    ]);
  });

  it('ignores directories without a proposal.md', async () => {
    await makeChange(project, 'real');
    await makeChange(project, 'not-a-change', false, false);

    expect((await repository.listChanges(project)).map((c) => c.name)).toEqual(['real']);
  });

  it('returns an empty list when the project has no changes', async () => {
    expect(await repository.listChanges(project)).toEqual([]);
  });

  it('loads proposal/design/tasks, with absent files as none', async () => {
    const dir = await makeChange(project, 'add-auth');
    await writeFile(join(dir, 'tasks.md'), '## 1. G\n- [x] 1.1 done it\n- [ ] 1.2 not yet\n', 'utf8');

    const detail = await repository.loadChange(project, 'add-auth');

    expect(detail.proposal.getOrThrow()).toContain('add-auth');
    expect(detail.design.isNone()).toBe(true);
    expect(detail.tasks.getOrThrow()[0].items.map((t) => t.done)).toEqual([true, false]);
  });

  it('resolves an archived change by name', async () => {
    await makeChange(project, '2026-01-01-old', true);

    expect((await repository.loadChange(project, '2026-01-01-old')).proposal.isSome()).toBe(true);
  });

  it('throws a not-found domain error for an unknown change', async () => {
    await expect(repository.loadChange(project, 'ghost')).rejects.toBeInstanceOf(DomainError);
  });

  it('reads this repository’s own archived change as a real fixture', async () => {
    const detail = await repository.loadChange(process.cwd(), '2026-06-04-discover-openspec-projects');

    expect(detail.proposal.isSome()).toBe(true);
    expect(detail.tasks.getOrThrow().length).toBeGreaterThan(0);
    const list = await repository.listChanges(process.cwd());
    expect(list.some((c) => c.name === '2026-06-04-discover-openspec-projects' && c.isArchived())).toBe(true);
  });

  it('toggles a task on disk, changing only that line', async () => {
    const dir = await makeChange(project, 'add-auth');
    const before = '## 1. G\n\n- [ ] 1.1 first\n- [x] 1.2 second\n';
    await writeFile(join(dir, 'tasks.md'), before, 'utf8');

    await repository.editTasks(project, 'add-auth', { kind: 'toggle', id: '1.1', expectedText: 'first' });

    const { readFile } = await import('node:fs/promises');
    const after = await readFile(join(dir, 'tasks.md'), 'utf8');
    expect(after).toBe('## 1. G\n\n- [x] 1.1 first\n- [x] 1.2 second\n');
  });

  it('rejects a stale edit and leaves the file unchanged', async () => {
    const dir = await makeChange(project, 'add-auth');
    const before = '## 1. G\n- [ ] 1.1 first\n';
    await writeFile(join(dir, 'tasks.md'), before, 'utf8');

    await expect(
      repository.editTasks(project, 'add-auth', { kind: 'toggle', id: '1.1', expectedText: 'drifted' }),
    ).rejects.toBeInstanceOf(DomainError);
    const { readFile } = await import('node:fs/promises');
    expect(await readFile(join(dir, 'tasks.md'), 'utf8')).toBe(before);
  });
});
