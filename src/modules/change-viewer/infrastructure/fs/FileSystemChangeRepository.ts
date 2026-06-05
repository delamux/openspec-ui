import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { Maybe } from '../../../../shared/domain/Maybe';
import { DomainError } from '../../../../shared/domain/DomainError';
import { Change } from '../../domain/Change';
import type { ChangeDetail } from '../../domain/ChangeDetail';
import type { ChangeRepository } from '../../domain/repositories/ChangeRepository';
import type { TaskEdit } from '../../domain/TaskEdit';
import { parseTasks } from '../parser/parseTasks';
import { applyTaskEdit } from '../parser/applyTaskEdit';

const PROPOSAL = 'proposal.md';
const DESIGN = 'design.md';
const TASKS = 'tasks.md';
const ARCHIVE = 'archive';

export class FileSystemChangeRepository implements ChangeRepository {
  async listChanges(projectPath: string): Promise<Change[]> {
    const changesDir = join(projectPath, 'openspec', 'changes');
    const active = await this.changeNamesIn(changesDir, [ARCHIVE]);
    const archived = await this.changeNamesIn(join(changesDir, ARCHIVE), []);
    return [
      ...[...active].sort().map((name) => Change.create(name, 'active')),
      ...[...archived].sort().reverse().map((name) => Change.create(name, 'archived')),
    ];
  }

  async loadChange(projectPath: string, changeName: string): Promise<ChangeDetail> {
    const dir = await this.resolveChangeDir(projectPath, changeName);
    const tasks = await readFileMaybe(join(dir, TASKS));
    return {
      proposal: await readFileMaybe(join(dir, PROPOSAL)),
      design: await readFileMaybe(join(dir, DESIGN)),
      tasks: tasks.map(parseTasks),
    };
  }

  async editTasks(projectPath: string, changeName: string, edit: TaskEdit): Promise<void> {
    const dir = await this.resolveChangeDir(projectPath, changeName);
    const path = join(dir, TASKS);
    const current = await readFileMaybe(path);
    const raw = current.fold(
      () => {
        throw DomainError.createNotFound(`Change has no tasks.md: ${changeName}`);
      },
      (value) => value,
    );
    await writeFile(path, applyTaskEdit(raw, edit), 'utf8');
  }

  private async changeNamesIn(dir: string, exclude: string[]): Promise<string[]> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (isFileNotFound(error)) {
        return [];
      }
      throw DomainError.create(`Could not read changes directory: "${dir}"`);
    }
    const directories = entries.filter((entry) => entry.isDirectory() && !exclude.includes(entry.name));
    const checked = await Promise.all(
      directories.map(async (entry) => ((await exists(join(dir, entry.name, PROPOSAL))) ? entry.name : null)),
    );
    return checked.filter((name): name is string => name !== null);
  }

  private async resolveChangeDir(projectPath: string, changeName: string): Promise<string> {
    const activeDir = join(projectPath, 'openspec', 'changes', changeName);
    if (await exists(activeDir)) {
      return activeDir;
    }
    const archivedDir = join(projectPath, 'openspec', 'changes', ARCHIVE, changeName);
    if (await exists(archivedDir)) {
      return archivedDir;
    }
    throw DomainError.createNotFound(`Change not found: "${changeName}"`);
  }
}

async function readFileMaybe(path: string): Promise<Maybe<string>> {
  try {
    return Maybe.some(await readFile(path, 'utf8'));
  } catch (error) {
    if (isFileNotFound(error)) {
      return Maybe.none();
    }
    throw DomainError.create(`Could not read file: "${path}"`);
  }
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true).catch(() => false);
}

function isFileNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === 'ENOENT';
}
