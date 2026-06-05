export type DomainErrorKind = 'not-found' | 'validation' | 'conflict' | 'generic';

export class DomainError extends Error {
  private constructor(
    readonly kind: DomainErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }

  static createNotFound(message: string): DomainError {
    return new DomainError('not-found', message);
  }

  static createValidation(message: string): DomainError {
    return new DomainError('validation', message);
  }

  static createConflict(message: string): DomainError {
    return new DomainError('conflict', message);
  }

  static create(message: string): DomainError {
    return new DomainError('generic', message);
  }

  isNotFound(): boolean {
    return this.kind === 'not-found';
  }

  isValidation(): boolean {
    return this.kind === 'validation';
  }

  isConflict(): boolean {
    return this.kind === 'conflict';
  }
}
