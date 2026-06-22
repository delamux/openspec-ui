import { DomainError } from '../../../shared/domain/DomainError';
import { WorktreeName } from './WorktreeName';

const ALLOWED = /^[A-Za-z0-9._/-]+$/;

export class BranchName {
  private constructor(readonly value: string) {}

  static create(value: string): BranchName {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw DomainError.createValidation('Branch name must not be empty');
    }
    if (trimmed.includes('..')) {
      throw DomainError.createValidation('Branch name must not contain ".."');
    }
    if (trimmed.startsWith('/') || trimmed.endsWith('/') || trimmed.includes('//')) {
      throw DomainError.createValidation(`Branch name has invalid slashes: "${value}"`);
    }
    if (!ALLOWED.test(trimmed)) {
      throw DomainError.createValidation(`Branch name has invalid characters: "${value}"`);
    }
    return new BranchName(trimmed);
  }

  static forChange(changeName: string): BranchName {
    return BranchName.create(`change/${WorktreeName.create(changeName).value}`);
  }
}
