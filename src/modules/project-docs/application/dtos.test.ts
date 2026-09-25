import { describe, it, expect } from 'vitest';
import { toProjectDocumentsDto, toProjectDocumentDto } from './dtos';
import { ProjectDocumentIndex } from '../domain/ProjectDocumentIndex';
import { DocumentPath } from '../domain/DocumentPath';

describe('project-docs dtos', () => {
  it('serialises the non-empty sections in order with labels and the default document', () => {
    const index = ProjectDocumentIndex.fromPaths(
      ['README.md', 'openspec/config.yaml', 'CLAUDE.md'].map((path) => DocumentPath.create(path)),
    );

    expect(toProjectDocumentsDto(index)).toEqual({
      kind: 'ok',
      sections: [
        { id: 'config', label: 'Config', documents: ['openspec/config.yaml'] },
        { id: 'agents', label: 'Agents & skills', documents: ['CLAUDE.md'] },
        { id: 'docs', label: 'Docs', documents: ['README.md'] },
      ],
      defaultDocument: 'openspec/config.yaml',
    });
  });

  it('uses null for the default document of an empty project', () => {
    expect(toProjectDocumentsDto(ProjectDocumentIndex.fromPaths([]))).toEqual({
      kind: 'ok',
      sections: [],
      defaultDocument: null,
    });
  });

  it('serialises a document with its format', () => {
    const path = DocumentPath.create('openspec/config.yaml');

    expect(toProjectDocumentDto({ path, content: 'schema: spec-driven' })).toEqual({
      kind: 'ok',
      path: 'openspec/config.yaml',
      format: 'yaml',
      content: 'schema: spec-driven',
    });
  });
});
