import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileSystemProjectRepository } from './FileSystemProjectRepository';
import { ProjectsRoot } from '../../domain/ProjectsRoot';
import { DomainError } from '../../../../shared/domain/DomainError';

async function makeOpenSpecProject(root: string, name: string): Promise<void> {
  await mkdir(join(root, name, 'openspec'), { recursive: true });
  await writeFile(join(root, name, 'openspec', 'config.yaml'), 'schema: spec-driven\n', 'utf8');
}

describe('FileSystemProjectRepository', () => {
  let root: string;
  const repository = new FileSystemProjectRepository();

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'openspec-ui-repo-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('discovers direct child directories that contain openspec/config.yaml', async () => {
    await makeOpenSpecProject(root, 'app-one');
    await makeOpenSpecProject(root, 'app-two');

    const projects = await repository.discoverUnder(ProjectsRoot.create(root));

    expect(projects.map((project) => project.name).sort()).toEqual(['app-one', 'app-two']);
    expect(projects.every((project) => project.path.startsWith(root))).toBe(true);
  });

  it('ignores directories without openspec/config.yaml', async () => {
    await makeOpenSpecProject(root, 'real');
    await mkdir(join(root, 'not-openspec'), { recursive: true });

    const projects = await repository.discoverUnder(ProjectsRoot.create(root));

    expect(projects.map((project) => project.name)).toEqual(['real']);
  });

  it('ignores files at the root', async () => {
    await makeOpenSpecProject(root, 'real');
    await writeFile(join(root, 'README.md'), '# hi', 'utf8');

    const projects = await repository.discoverUnder(ProjectsRoot.create(root));

    expect(projects.map((project) => project.name)).toEqual(['real']);
  });

  it('does not discover projects nested deeper than a direct child', async () => {
    await makeOpenSpecProject(join(root, 'group'), 'deep');

    const projects = await repository.discoverUnder(ProjectsRoot.create(root));

    expect(projects).toEqual([]);
  });

  it('returns an empty list when no child is OpenSpec-enabled', async () => {
    await mkdir(join(root, 'plain'), { recursive: true });

    expect(await repository.discoverUnder(ProjectsRoot.create(root))).toEqual([]);
  });

  it('throws a not-found domain error when the root no longer exists', async () => {
    const missing = ProjectsRoot.create(join(root, 'gone'));

    await expect(repository.discoverUnder(missing)).rejects.toBeInstanceOf(DomainError);
  });
});
