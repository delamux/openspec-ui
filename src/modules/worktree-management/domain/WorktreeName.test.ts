import { describe, it, expect } from 'vitest';
import { WorktreeName } from './WorktreeName';
import { DomainError } from '../../../shared/domain/DomainError';

describe('WorktreeName', () => {
  it('accepts a conventional kebab-case change name', () => {
    expect(WorktreeName.create('add-auth').value).toBe('add-auth');
  });

  it('trims surrounding whitespace', () => {
    expect(WorktreeName.create('  fix.parser_2  ').value).toBe('fix.parser_2');
  });

  it('rejects an empty name', () => {
    expect(() => WorktreeName.create('   ')).toThrow(DomainError);
  });

  it('rejects a path separator', () => {
    expect(() => WorktreeName.create('a/b')).toThrow(DomainError);
  });

  it('rejects path traversal', () => {
    expect(() => WorktreeName.create('..')).toThrow(DomainError);
  });

  it('rejects shell metacharacters and spaces', () => {
    expect(() => WorktreeName.create('a b')).toThrow(DomainError);
    expect(() => WorktreeName.create('a;rm')).toThrow(DomainError);
  });
});
