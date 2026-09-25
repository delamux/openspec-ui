import { describe, it, expect } from 'vitest';
import { ProjectDocumentIndex } from './ProjectDocumentIndex';
import { DocumentPath } from './DocumentPath';
import { DocumentSection } from './DocumentSection';

function indexOf(...paths: string[]): ProjectDocumentIndex {
  return ProjectDocumentIndex.fromPaths(paths.map((path) => DocumentPath.create(path)));
}

function valuesIn(index: ProjectDocumentIndex, section: DocumentSection): string[] {
  return index.documentsIn(section).map((path) => path.value);
}

describe('ProjectDocumentIndex', () => {
  it('is empty when the project has no documents', () => {
    const index = indexOf();
    expect(index.isEmpty()).toBe(true);
    expect(index.defaultDocument().isNone()).toBe(true);
  });

  it('groups documents by section, sorted by path', () => {
    const index = indexOf('docs/guide.md', 'CLAUDE.md', 'openspec/specs/b/spec.md', 'openspec/specs/a/spec.md');

    expect(valuesIn(index, DocumentSection.Agents)).toEqual(['CLAUDE.md']);
    expect(valuesIn(index, DocumentSection.Specs)).toEqual(['openspec/specs/a/spec.md', 'openspec/specs/b/spec.md']);
    expect(valuesIn(index, DocumentSection.Docs)).toEqual(['docs/guide.md']);
    expect(valuesIn(index, DocumentSection.Config)).toEqual([]);
  });

  it('lists README files first in Docs, the root one before nested ones', () => {
    const index = indexOf('api.md', 'docs/README.md', 'README.md', 'docs/guide.md');

    expect(valuesIn(index, DocumentSection.Docs)).toEqual(['README.md', 'docs/README.md', 'api.md', 'docs/guide.md']);
  });

  it('ignores duplicate paths', () => {
    expect(valuesIn(indexOf('README.md', './README.md'), DocumentSection.Docs)).toEqual(['README.md']);
  });

  it('defaults to the OpenSpec config', () => {
    expect(indexOf('README.md', 'openspec/config.yaml').defaultDocument().getOrThrow().value).toBe('openspec/config.yaml');
  });

  it('defaults to the root README when there is no config', () => {
    expect(indexOf('docs/README.md', 'README.md').defaultDocument().getOrThrow().value).toBe('README.md');
  });

  it('defaults to the first document in section order otherwise', () => {
    expect(indexOf('docs/guide.md', '.claude/skills/x/SKILL.md').defaultDocument().getOrThrow().value).toBe(
      '.claude/skills/x/SKILL.md',
    );
  });

  it('knows whether it contains a path', () => {
    const index = indexOf('README.md');
    expect(index.contains(DocumentPath.create('README.md'))).toBe(true);
    expect(index.contains(DocumentPath.create('docs/guide.md'))).toBe(false);
  });
});
