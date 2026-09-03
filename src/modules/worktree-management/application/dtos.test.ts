import { describe, it, expect } from 'vitest';
import { toSelectableChangeDto } from './dtos';
import { Maybe } from '../../../shared/domain/Maybe';
import type { Progress } from '../../change-viewer/domain/TaskList';

const noProgress = Maybe.none<Progress>();

describe('toSelectableChangeDto', () => {
  it('maps a main change to an option labeled with its name', () => {
    const dto = toSelectableChangeDto({
      name: 'add-auth',
      status: 'active',
      sourcePath: '/p',
      worktreeName: Maybe.none(),
      progress: noProgress,
    });

    expect(dto).toEqual({
      key: 'add-auth',
      name: 'add-auth',
      status: 'active',
      label: 'add-auth',
      sourcePath: '/p',
      worktreeName: null,
      progress: null,
    });
  });

  it('keys a worktree change by its worktree and carries the worktree name for grouping', () => {
    const dto = toSelectableChangeDto({
      name: 'add-auth',
      status: 'active',
      sourcePath: '/p/.claude/worktrees/add-auth',
      worktreeName: Maybe.some('add-auth'),
      progress: noProgress,
    });

    expect(dto.key).toBe('add-auth::add-auth');
    expect(dto.label).toBe('add-auth');
    expect(dto.worktreeName).toBe('add-auth');
  });

  it('appends the task count to the label of a change that has tasks', () => {
    const dto = toSelectableChangeDto({
      name: 'add-auth',
      status: 'active',
      sourcePath: '/p',
      worktreeName: Maybe.none(),
      progress: Maybe.some({ done: 0, total: 7, pct: 0 }),
    });

    expect(dto.label).toBe('add-auth · 0/7 tasks');
    expect(dto.progress).toEqual({ done: 0, total: 7, pct: 0 });
  });

  it('drops the archive date prefix from the label of an archived change', () => {
    const dto = toSelectableChangeDto({
      name: '2026-06-05-edit-change-tasks',
      status: 'archived',
      sourcePath: '/p',
      worktreeName: Maybe.none(),
      progress: Maybe.some({ done: 5, total: 5, pct: 100 }),
    });

    expect(dto.label).toBe('edit-change-tasks · 5/5 tasks');
  });

  it('keeps the name of an active change that starts with a date', () => {
    const dto = toSelectableChangeDto({
      name: '2026-06-05-edit-change-tasks',
      status: 'active',
      sourcePath: '/p',
      worktreeName: Maybe.none(),
      progress: noProgress,
    });

    expect(dto.label).toBe('2026-06-05-edit-change-tasks');
  });

  it('leaves the label untouched when the change has no task at all', () => {
    const dto = toSelectableChangeDto({
      name: 'add-auth',
      status: 'active',
      sourcePath: '/p',
      worktreeName: Maybe.none(),
      progress: Maybe.some({ done: 0, total: 0, pct: 0 }),
    });

    expect(dto.label).toBe('add-auth');
  });
});
