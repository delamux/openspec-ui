import { describe, it, expect } from 'vitest';
import { ReadProjectDocument } from './ReadProjectDocument';
import { InMemoryProjectDocumentRepository } from '../domain/repositories/ProjectDocumentRepository';
import { DomainError } from '../../../shared/domain/DomainError';

const repository = new InMemoryProjectDocumentRepository(
  new Map([['/p', new Map([['.claude/skills/tdd/SKILL.md', '---\nname: tdd\n---\n# TDD']])]]),
);
const useCase = new ReadProjectDocument(repository);

async function errorFrom(operation: Promise<unknown>): Promise<DomainError> {
  try {
    await operation;
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the operation to fail');
}

describe('ReadProjectDocument', () => {
  it('returns the document content unchanged', async () => {
    const document = await useCase.execute('/p', '.claude/skills/tdd/SKILL.md');

    expect(document.path.value).toBe('.claude/skills/tdd/SKILL.md');
    expect(document.content).toBe('---\nname: tdd\n---\n# TDD');
  });

  it('rejects a path that leaves the project', async () => {
    expect((await errorFrom(useCase.execute('/p', '../other/README.md'))).isValidation()).toBe(true);
  });

  it('fails with not-found for a missing document', async () => {
    expect((await errorFrom(useCase.execute('/p', 'docs/missing.md'))).isNotFound()).toBe(true);
  });
});
