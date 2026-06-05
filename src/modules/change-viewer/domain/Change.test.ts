import { describe, it, expect } from 'vitest';
import { Change } from './Change';
import { DomainError } from '../../../shared/domain/DomainError';

describe('Change', () => {
  it('creates an active change', () => {
    const change = Change.create('add-auth', 'active');

    expect(change.name).toBe('add-auth');
    expect(change.status).toBe('active');
    expect(change.isArchived()).toBe(false);
  });

  it('creates an archived change', () => {
    expect(Change.create('2026-06-04-add-auth', 'archived').isArchived()).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(() => Change.create('  ', 'active')).toThrow(DomainError);
  });
});
