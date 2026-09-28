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

  it('orders archived changes newest archive date first, then by name, undated last', () => {
    const names = ['2026-06-05-view', 'no-date', '2026-06-04-first', '2026-09-03-mobile', '2026-06-05-align'];

    const sorted = names.map((name) => Change.create(name, 'archived')).sort(Change.byArchiveDateNewestFirst);

    expect(sorted.map((change) => change.name)).toEqual([
      '2026-09-03-mobile',
      '2026-06-05-align',
      '2026-06-05-view',
      '2026-06-04-first',
      'no-date',
    ]);
  });
});
