import { describe, it, expect } from 'vitest';
import { BranchName } from './BranchName';
import { DomainError } from '../../../shared/domain/DomainError';

describe('BranchName', () => {
  it('accepts a conventional branch with a slash', () => {
    expect(BranchName.create('change/add-auth').value).toBe('change/add-auth');
  });

  it('derives change/<name> for a change', () => {
    expect(BranchName.forChange('add-auth').value).toBe('change/add-auth');
  });

  it('rejects an unsafe change name when deriving', () => {
    expect(() => BranchName.forChange('a b')).toThrow(DomainError);
  });

  it('rejects "..", leading/trailing/double slashes', () => {
    expect(() => BranchName.create('change/../x')).toThrow(DomainError);
    expect(() => BranchName.create('/change/x')).toThrow(DomainError);
    expect(() => BranchName.create('change/x/')).toThrow(DomainError);
    expect(() => BranchName.create('change//x')).toThrow(DomainError);
  });

  it('rejects spaces and shell metacharacters', () => {
    expect(() => BranchName.create('change/a b')).toThrow(DomainError);
    expect(() => BranchName.create('change/a;rm')).toThrow(DomainError);
  });
});
