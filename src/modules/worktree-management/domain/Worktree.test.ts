import { describe, it, expect } from 'vitest';
import { Worktree } from './Worktree';
import { Maybe } from '../../../shared/domain/Maybe';
import { DomainError } from '../../../shared/domain/DomainError';

describe('Worktree', () => {
  it('holds an absolute path, a branch, and a main flag', () => {
    const worktree = Worktree.create('/p/.claude/worktrees/add-auth', Maybe.some('change/add-auth'), false);

    expect(worktree.path).toBe('/p/.claude/worktrees/add-auth');
    expect(worktree.branch.getOrThrow()).toBe('change/add-auth');
    expect(worktree.isMain).toBe(false);
  });

  it('rejects a non-absolute path', () => {
    expect(() => Worktree.create('relative', Maybe.none(), false)).toThrow(DomainError);
  });

  it('reports a detached HEAD when there is no branch', () => {
    expect(Worktree.create('/p/wt', Maybe.none(), false).isDetached()).toBe(true);
  });

  it('derives the change name from a change/<name> branch', () => {
    const worktree = Worktree.create('/p/wt', Maybe.some('change/add-auth'), false);

    expect(worktree.changeName().getOrThrow()).toBe('add-auth');
  });

  it('has no change name for an unrelated branch', () => {
    const worktree = Worktree.create('/p/wt', Maybe.some('main'), false);

    expect(worktree.changeName().isNone()).toBe(true);
  });

  it('refuses to be removed when it is the main checkout', () => {
    expect(() => Worktree.create('/p', Maybe.some('main'), true).ensureRemovable()).toThrow(DomainError);
  });
});
