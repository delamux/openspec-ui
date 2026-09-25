import { describe, it, expect } from 'vitest';
import { InMemoryProjectDocumentRepository } from './ProjectDocumentRepository';
import { DocumentPath } from '../DocumentPath';

describe('InMemoryProjectDocumentRepository', () => {
  const repository = new InMemoryProjectDocumentRepository(new Map([['/p', new Map([['README.md', '# Hello']])]]));

  it('lists the paths of a project', async () => {
    expect((await repository.listDocumentPaths('/p')).map((path) => path.value)).toEqual(['README.md']);
    expect(await repository.listDocumentPaths('/unknown')).toEqual([]);
  });

  it('reads a document, or none when it is missing', async () => {
    expect((await repository.readDocument('/p', DocumentPath.create('README.md'))).getOrThrow()).toBe('# Hello');
    expect((await repository.readDocument('/p', DocumentPath.create('docs/missing.md'))).isNone()).toBe(true);
  });
});
