import { describe, it, expect } from 'vitest';
import { matchSelectableChange, searchFromSelection, selectionFromSearch } from './selectionUrl';
import type { SelectableChangeDto } from '../../application/dtos';

function change(overrides: Partial<SelectableChangeDto>): SelectableChangeDto {
  return {
    key: 'add-auth',
    name: 'add-auth',
    status: 'active',
    label: 'add-auth',
    sourcePath: '/p',
    worktreeName: null,
    progress: null,
    ...overrides,
  };
}

describe('selectionFromSearch', () => {
  it('reads an empty selection from an empty query', () => {
    expect(selectionFromSearch('')).toEqual({ projectPath: '', changeName: '', worktreeName: '' });
  });

  it('reads the project and a main change', () => {
    expect(selectionFromSearch('?project=/p&change=add-auth')).toEqual({
      projectPath: '/p',
      changeName: 'add-auth',
      worktreeName: '',
    });
  });

  it('reads a worktree alongside the change', () => {
    expect(selectionFromSearch('?project=/p&change=add-auth&worktree=wt-a')).toEqual({
      projectPath: '/p',
      changeName: 'add-auth',
      worktreeName: 'wt-a',
    });
  });
});

describe('searchFromSelection', () => {
  it('writes only the params that are set', () => {
    expect(searchFromSelection({ projectPath: '/p', changeName: '', worktreeName: '' })).toBe('?project=%2Fp');
    expect(searchFromSelection({ projectPath: '/p', changeName: 'add-auth', worktreeName: '' })).toBe(
      '?project=%2Fp&change=add-auth',
    );
  });

  it('writes the worktree when a worktree change is selected', () => {
    expect(searchFromSelection({ projectPath: '/p', changeName: 'add-auth', worktreeName: 'wt-a' })).toBe(
      '?project=%2Fp&change=add-auth&worktree=wt-a',
    );
  });

  it('writes an empty search when nothing is selected', () => {
    expect(searchFromSelection({ projectPath: '', changeName: '', worktreeName: '' })).toBe('');
  });
});

describe('matchSelectableChange', () => {
  const main = change({ key: 'add-auth', sourcePath: '/p' });
  const inWorktree = change({
    key: 'wt-a::add-auth',
    sourcePath: '/p/.claude/worktrees/wt-a',
    worktreeName: 'wt-a',
  });
  const other = change({ key: 'wt-a::other', name: 'other', label: 'other', worktreeName: 'wt-a' });

  it('matches a main change when no worktree is in the query', () => {
    expect(matchSelectableChange([main, inWorktree], 'add-auth', '')).toBe(main);
  });

  it('matches the worktree change when the worktree is in the query', () => {
    expect(matchSelectableChange([main, inWorktree, other], 'add-auth', 'wt-a')).toBe(inWorktree);
  });

  it('matches nothing when the named worktree change is absent', () => {
    expect(matchSelectableChange([main], 'add-auth', 'wt-a')).toBeUndefined();
  });

  it('matches nothing when no change name is given', () => {
    expect(matchSelectableChange([main], '', '')).toBeUndefined();
  });
});
