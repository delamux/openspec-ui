import { readdir, readFile, realpath } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join, sep } from 'node:path';
import { Maybe } from '../../../../shared/domain/Maybe';
import { DomainError } from '../../../../shared/domain/DomainError';
import { DocumentPath, OPENSPEC_CONFIG } from '../../domain/DocumentPath';
import type { ProjectDocumentRepository } from '../../domain/repositories/ProjectDocumentRepository';

const IGNORED_FOLDERS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'vendor',
  'target',
  '.astro',
  '.next',
  '.nuxt',
  '.turbo',
  '.cache',
  '.venv',
  '__pycache__',
]);
// Change folders are browsed in the Changes tab, so they are left out here.
const IGNORED_PATHS = new Set(['openspec/changes']);
const DOCUMENT_FILE = /\.(md|markdown)$/i;
const MAX_DEPTH = 8;
const MAX_DOCUMENTS = 2000;

function isDocumentFile(relativePath: string): boolean {
  return DOCUMENT_FILE.test(relativePath) || relativePath === OPENSPEC_CONFIG;
}

async function entriesOf(directory: string): Promise<Dirent[]> {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
}

// A file name the domain would reject (a backslash in it, say) is skipped rather than failing the listing.
function documentPathOrNothing(relativePath: string): DocumentPath[] {
  try {
    return [DocumentPath.create(relativePath)];
  } catch {
    return [];
  }
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

export class FileSystemProjectDocumentRepository implements ProjectDocumentRepository {
  async listDocumentPaths(projectPath: string): Promise<DocumentPath[]> {
    const found: string[] = [];
    await this.walk(projectPath, '', 0, found);
    return found.flatMap((path) => documentPathOrNothing(path));
  }

  async readDocument(projectPath: string, path: DocumentPath): Promise<Maybe<string>> {
    try {
      const file = await realpath(join(projectPath, path.value));
      const root = await realpath(projectPath);
      if (!file.startsWith(root + sep)) {
        throw DomainError.createValidation('Document path must stay inside the project');
      }
      return Maybe.some(await readFile(file, 'utf8'));
    } catch (error) {
      if (isMissing(error)) {
        return Maybe.none();
      }
      throw error instanceof DomainError ? error : DomainError.create('Could not read the document from disk');
    }
  }

  // Dirent reports symbolic links as neither file nor directory, so links are never followed.
  private async walk(root: string, relativeDir: string, depth: number, found: string[]): Promise<void> {
    const entries = await entriesOf(join(root, relativeDir));
    const sorted = [...entries].sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of sorted) {
      if (found.length >= MAX_DOCUMENTS) {
        return;
      }
      const relativePath = relativeDir === '' ? entry.name : `${relativeDir}/${entry.name}`;
      if (entry.isFile() && isDocumentFile(relativePath)) {
        found.push(relativePath);
      }
      if (entry.isDirectory() && depth < MAX_DEPTH && !IGNORED_FOLDERS.has(entry.name) && !IGNORED_PATHS.has(relativePath)) {
        await this.walk(root, relativePath, depth + 1, found);
      }
    }
  }
}
