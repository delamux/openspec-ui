import { describe, it, expect } from 'vitest';
import { DomainError } from './DomainError';

describe('DomainError', () => {
  it('creates a validation error', () => {
    const error = DomainError.createValidation('path must be absolute');

    expect(error.isValidation()).toBe(true);
    expect(error.kind).toBe('validation');
    expect(error.message).toBe('path must be absolute');
  });

  it('creates a not-found error', () => {
    const error = DomainError.createNotFound('root not found');

    expect(error.isNotFound()).toBe(true);
    expect(error.kind).toBe('not-found');
  });

  it('creates a generic error', () => {
    const error = DomainError.create('something failed');

    expect(error.kind).toBe('generic');
    expect(error.isValidation()).toBe(false);
    expect(error.isNotFound()).toBe(false);
  });

  it('is an Error instance with a stable name', () => {
    const error = DomainError.create('boom');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DomainError');
  });
});
