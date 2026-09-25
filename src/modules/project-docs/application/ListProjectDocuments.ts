import { ProjectDocumentIndex } from '../domain/ProjectDocumentIndex';
import type { ProjectDocumentRepository } from '../domain/repositories/ProjectDocumentRepository';

export class ListProjectDocuments {
  constructor(private readonly repository: ProjectDocumentRepository) {}

  async execute(projectPath: string): Promise<ProjectDocumentIndex> {
    return ProjectDocumentIndex.fromPaths(await this.repository.listDocumentPaths(projectPath));
  }
}
