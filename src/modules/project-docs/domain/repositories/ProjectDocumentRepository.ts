import { Maybe } from '../../../../shared/domain/Maybe';
import { DocumentPath } from '../DocumentPath';

export interface ProjectDocumentRepository {
  listDocumentPaths(projectPath: string): Promise<DocumentPath[]>;
  readDocument(projectPath: string, path: DocumentPath): Promise<Maybe<string>>;
}

export class InMemoryProjectDocumentRepository implements ProjectDocumentRepository {
  // projectPath -> (relative document path -> content)
  constructor(private readonly documentsByProject: Map<string, Map<string, string>> = new Map()) {}

  async listDocumentPaths(projectPath: string): Promise<DocumentPath[]> {
    const documents = this.documentsByProject.get(projectPath) ?? new Map<string, string>();
    return [...documents.keys()].map((path) => DocumentPath.create(path));
  }

  async readDocument(projectPath: string, path: DocumentPath): Promise<Maybe<string>> {
    return Maybe.fromNullable(this.documentsByProject.get(projectPath)?.get(path.value));
  }
}
