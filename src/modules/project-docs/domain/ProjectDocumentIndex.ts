import { Maybe } from '../../../shared/domain/Maybe';
import { DocumentPath } from './DocumentPath';
import { DocumentSection, SECTION_ORDER } from './DocumentSection';

function compareDocuments(left: DocumentPath, right: DocumentPath): number {
  const readmeFirst = Number(right.isReadme()) - Number(left.isReadme());
  const shallowFirst = left.value.split('/').length - right.value.split('/').length;
  if (readmeFirst !== 0) {
    return readmeFirst;
  }
  if (left.isReadme() && shallowFirst !== 0) {
    return shallowFirst;
  }
  return left.value.localeCompare(right.value);
}

export class ProjectDocumentIndex {
  private constructor(private readonly sections: Map<DocumentSection, DocumentPath[]>) {}

  static fromPaths(paths: DocumentPath[]): ProjectDocumentIndex {
    const unique = [...new Map(paths.map((path) => [path.value, path])).values()];
    const sections = new Map(
      SECTION_ORDER.map((section) => [
        section,
        unique.filter((path) => path.section() === section).sort(compareDocuments),
      ]),
    );
    return new ProjectDocumentIndex(sections);
  }

  documentsIn(section: DocumentSection): DocumentPath[] {
    return [...(this.sections.get(section) ?? [])];
  }

  isEmpty(): boolean {
    return this.all().length === 0;
  }

  contains(path: DocumentPath): boolean {
    return this.all().some((candidate) => candidate.value === path.value);
  }

  defaultDocument(): Maybe<DocumentPath> {
    const rootReadme = this.documentsIn(DocumentSection.Docs).find((path) => path.isReadme() && !path.value.includes('/'));
    const [config] = this.documentsIn(DocumentSection.Config);
    const [first] = this.all();
    return Maybe.fromNullable(config ?? rootReadme ?? first);
  }

  private all(): DocumentPath[] {
    return SECTION_ORDER.flatMap((section) => this.documentsIn(section));
  }
}
