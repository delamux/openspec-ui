import { DomainError } from '../../../shared/domain/DomainError';
import { DocumentPath } from '../domain/DocumentPath';
import type { ProjectDocument } from '../domain/ProjectDocument';
import type { ProjectDocumentRepository } from '../domain/repositories/ProjectDocumentRepository';

export class ReadProjectDocument {
  constructor(private readonly repository: ProjectDocumentRepository) {}

  async execute(projectPath: string, rawPath: string): Promise<ProjectDocument> {
    const path = DocumentPath.create(rawPath);
    const content = await this.repository.readDocument(projectPath, path);
    return content.fold(
      () => {
        throw DomainError.createNotFound(`Document not found: ${path.value}`);
      },
      (value) => ({ path, content: value }),
    );
  }
}
