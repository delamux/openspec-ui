import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { FileSystemProjectDocumentRepository } from './FileSystemProjectDocumentRepository';
import { DocumentPath } from '../../domain/DocumentPath';
import { DomainError } from '../../../../shared/domain/DomainError';

async function put(root: string, relative: string, content = `# ${relative}\n`): Promise<void> {
  const path = join(root, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

describe('FileSystemProjectDocumentRepository', () => {
  const repository = new FileSystemProjectDocumentRepository();
  let sandbox: string;
  let project: string;

  beforeEach(async () => {
    sandbox = await mkdtemp(join(tmpdir(), 'openspec-ui-docs-'));
    project = join(sandbox, 'project');
    await mkdir(project);
  });

  afterEach(async () => {
    await rm(sandbox, { recursive: true, force: true });
  });

  async function listed(): Promise<string[]> {
    return (await repository.listDocumentPaths(project)).map((path) => path.value).sort();
  }

  it('finds markdown documents, hidden agent folders and the OpenSpec config', async () => {
    await put(project, 'README.md');
    await put(project, 'docs/guide.markdown');
    await put(project, '.claude/skills/tdd/SKILL.md');
    await put(project, 'openspec/config.yaml', 'schema: spec-driven\n');
    await put(project, 'openspec/specs/auth/spec.md');
    await put(project, 'package.json', '{}');
    await put(project, 'other.yaml', 'a: 1\n');

    expect(await listed()).toEqual([
      '.claude/skills/tdd/SKILL.md',
      'README.md',
      'docs/guide.markdown',
      'openspec/config.yaml',
      'openspec/specs/auth/spec.md',
    ]);
  });

  it('skips dependency, build and git folders and the change folders', async () => {
    await put(project, 'README.md');
    await put(project, 'node_modules/pkg/README.md');
    await put(project, '.git/info.md');
    await put(project, 'dist/README.md');
    await put(project, 'openspec/changes/add-auth/proposal.md');

    expect(await listed()).toEqual(['README.md']);
  });

  it('does not follow symbolic links', async () => {
    await put(sandbox, 'outside/secret.md');
    await symlink(join(sandbox, 'outside'), join(project, 'linked'));
    await symlink(join(sandbox, 'outside', 'secret.md'), join(project, 'secret.md'));

    expect(await listed()).toEqual([]);
  });

  it('returns an empty list when the project folder does not exist', async () => {
    expect(await repository.listDocumentPaths(join(sandbox, 'missing'))).toEqual([]);
  });

  it('reads a document unchanged', async () => {
    await put(project, '.claude/skills/tdd/SKILL.md', '---\nname: tdd\n---\n# TDD\n');

    const content = await repository.readDocument(project, DocumentPath.create('.claude/skills/tdd/SKILL.md'));

    expect(content.getOrThrow()).toBe('---\nname: tdd\n---\n# TDD\n');
  });

  it('returns none for a missing document', async () => {
    expect((await repository.readDocument(project, DocumentPath.create('docs/missing.md'))).isNone()).toBe(true);
  });

  it('refuses a symbolic link that points outside the project', async () => {
    await put(sandbox, 'outside/secret.md', 'secret');
    await symlink(join(sandbox, 'outside', 'secret.md'), join(project, 'secret.md'));

    await expect(repository.readDocument(project, DocumentPath.create('secret.md'))).rejects.toSatisfy(
      (error: unknown) => error instanceof DomainError && error.isValidation(),
    );
  });
});
