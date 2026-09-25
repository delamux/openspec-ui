import type { DocumentFormat } from '../domain/DocumentPath';
import { DocumentSection, SECTION_ORDER } from '../domain/DocumentSection';
import type { ProjectDocument } from '../domain/ProjectDocument';
import type { ProjectDocumentIndex } from '../domain/ProjectDocumentIndex';

const SECTION_LABELS: Record<DocumentSection, string> = {
  [DocumentSection.Config]: 'Config',
  [DocumentSection.Agents]: 'Agents & skills',
  [DocumentSection.Specs]: 'Specs',
  [DocumentSection.Docs]: 'Docs',
};

export interface DocumentSectionDto {
  id: DocumentSection;
  label: string;
  documents: string[];
}

export type ProjectDocumentsResultDto =
  | { kind: 'ok'; sections: DocumentSectionDto[]; defaultDocument: string | null }
  | { kind: 'error'; message: string };

export type ProjectDocumentResultDto =
  | { kind: 'ok'; path: string; format: DocumentFormat; content: string }
  | { kind: 'error'; message: string };

export function toProjectDocumentsDto(index: ProjectDocumentIndex): ProjectDocumentsResultDto {
  const sections = SECTION_ORDER.map((section) => ({
    id: section,
    label: SECTION_LABELS[section],
    documents: index.documentsIn(section).map((path) => path.value),
  })).filter((section) => section.documents.length > 0);
  return {
    kind: 'ok',
    sections,
    defaultDocument: index.defaultDocument().fold<string | null>(
      () => null,
      (path) => path.value,
    ),
  };
}

export function toProjectDocumentDto(document: ProjectDocument): ProjectDocumentResultDto {
  return { kind: 'ok', path: document.path.value, format: document.path.format(), content: document.content };
}
