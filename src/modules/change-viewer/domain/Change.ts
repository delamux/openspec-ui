import { DomainError } from '../../../shared/domain/DomainError';

export type ChangeStatus = 'active' | 'archived';

// `openspec archive` prefixes the folder with the archive date: 2026-06-04-add-auth.
const ARCHIVE_DATE = /^(\d{4}-\d{2}-\d{2})-/;

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

  // Newest archive first; changes archived the same day by name; undated ones last.
  static byArchiveDateNewestFirst(left: Change, right: Change): number {
    const leftDate = left.archiveDate();
    const rightDate = right.archiveDate();
    if (leftDate !== rightDate) {
      return rightDate.localeCompare(leftDate);
    }
    return left.name.localeCompare(right.name);
  }

  private archiveDate(): string {
    return ARCHIVE_DATE.exec(this.name)?.[1] ?? '';
  }
}
