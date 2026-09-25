import { describe, it, expect } from 'vitest';
import { ListProjectDocuments } from './ListProjectDocuments';
import { InMemoryProjectDocumentRepository } from '../domain/repositories/ProjectDocumentRepository';
import { DocumentSection } from '../domain/DocumentSection';

describe('ListProjectDocuments', () => {
  it('returns the project documents indexed by section', async () => {
    const repository = new InMemoryProjectDocumentRepository(
      new Map([['/p', new Map([['README.md', ''], ['openspec/config.yaml', 'schema: spec-driven']])]]),
    );

    const index = await new ListProjectDocuments(repository).execute('/p');

    expect(index.documentsIn(DocumentSection.Config).map((path) => path.value)).toEqual(['openspec/config.yaml']);
    expect(index.documentsIn(DocumentSection.Docs).map((path) => path.value)).toEqual(['README.md']);
  });
});
