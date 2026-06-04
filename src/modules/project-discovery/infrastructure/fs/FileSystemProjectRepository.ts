import { readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { Project } from '../../domain/Project';
import { ProjectsRoot } from '../../domain/ProjectsRoot';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import { DomainError } from '../../../../shared/domain/DomainError';

export class FileSystemProjectRepository implements ProjectRepository {
  async discoverUnder(root: ProjectsRoot): Promise<Project[]> {
    const directories = await this.childDirectories(root);
    const candidates = await Promise.all(
      directories.map((name) => this.toProjectIfOpenSpec(root.path, name)),
    );
    return candidates.filter((project): project is Project => project !== null);
  }

  private async childDirectories(root: ProjectsRoot): Promise<string[]> {
    try {
      const entries = await readdir(root.path, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch (error) {
      if (isFileNotFound(error)) {
        throw DomainError.createNotFound(`Projects root no longer exists: "${root.path}"`);
      }
      throw DomainError.create(`Could not read projects root: "${root.path}"`);
    }
  }

  private async toProjectIfOpenSpec(rootPath: string, name: string): Promise<Project | null> {
    const configPath = join(rootPath, name, 'openspec', 'config.yaml');
    return (await exists(configPath)) ? Project.create(name, join(rootPath, name)) : null;
  }
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true).catch(() => false);
}

function isFileNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === 'ENOENT';
}
