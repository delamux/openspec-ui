import { DomainError } from '../../../shared/domain/DomainError';

const ALLOWED = /^[A-Za-z0-9._-]+$/;

export class WorktreeName {
  private constructor(readonly value: string) {}

  static create(value: string): WorktreeName {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw DomainError.createValidation('Worktree name must not be empty');
    }
    if (trimmed === '.' || trimmed === '..') {
      throw DomainError.createValidation('Worktree name must not be a path traversal');
    }
    if (!ALLOWED.test(trimmed)) {
      throw DomainError.createValidation(`Worktree name has invalid characters: "${value}"`);
    }
    return new WorktreeName(trimmed);
  }
}
