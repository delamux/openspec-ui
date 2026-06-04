import { DomainError } from '../../../shared/domain/DomainError';

export class Project {
  private constructor(
    readonly name: string,
    readonly path: string,
  ) {}

  static create(name: string, path: string): Project {
    if (!path.startsWith('/')) {
      throw DomainError.createValidation(`Project path must be absolute: "${path}"`);
    }
    if (name.trim().length === 0) {
      throw DomainError.createValidation('Project name must not be empty');
    }
    return new Project(name, path);
  }

  static fromDirectory(path: string): Project {
    return Project.create(directoryName(path), path);
  }
}

function directoryName(path: string): string {
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return segments[segments.length - 1] ?? '';
}
