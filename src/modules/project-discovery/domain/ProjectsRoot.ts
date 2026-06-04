import { DomainError } from '../../../shared/domain/DomainError';

export class ProjectsRoot {
  private constructor(readonly path: string) {}

  static create(rawPath: string): ProjectsRoot {
    const path = rawPath.trim();
    if (path.length === 0) {
      throw DomainError.createValidation('Projects root path must not be empty');
    }
    if (!path.startsWith('/')) {
      throw DomainError.createValidation(`Projects root path must be absolute: "${path}"`);
    }
    return new ProjectsRoot(path);
  }

  equals(other: ProjectsRoot): boolean {
    return this.path === other.path;
  }
}
