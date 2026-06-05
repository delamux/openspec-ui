import { DomainError } from '../../../shared/domain/DomainError';

export type ChangeStatus = 'active' | 'archived';

export class Change {
  private constructor(
    readonly name: string,
    readonly status: ChangeStatus,
  ) {}

  static create(name: string, status: ChangeStatus): Change {
    if (name.trim().length === 0) {
      throw DomainError.createValidation('Change name must not be empty');
    }
    return new Change(name, status);
  }

  isArchived(): boolean {
    return this.status === 'archived';
  }
}
