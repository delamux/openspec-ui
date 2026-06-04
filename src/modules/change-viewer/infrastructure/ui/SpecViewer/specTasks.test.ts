import { describe, it, expect } from 'vitest';
import { toggleTask, removeTask, addTask, progress, type TaskGroup } from './specTasks';

function groups(): TaskGroup[] {
  return [
    { title: 'A', items: [{ id: '1.1', text: 'one', done: true }, { id: '1.2', text: 'two', done: false }] },
    { title: 'B', items: [{ id: '2.1', text: 'three', done: false }] },
  ];
}

describe('specTasks', () => {
  it('toggles a single task without mutating the input', () => {
    const input = groups();
    const next = toggleTask(input, 0, 1);

    expect(next[0].items[1].done).toBe(true);
    expect(input[0].items[1].done).toBe(false);
  });

  it('removes a task from the right group', () => {
    const next = removeTask(groups(), 0, 0);

    expect(next[0].items.map((item) => item.id)).toEqual(['1.2']);
    expect(next[1].items).toHaveLength(1);
  });

  it('appends a new task to the last group with a derived id', () => {
    const next = addTask(groups(), '  new task  ');
    const lastGroup = next[next.length - 1];

    expect(lastGroup.items[lastGroup.items.length - 1]).toEqual({ id: '2.2', text: 'new task', done: false });
  });

  it('ignores blank additions', () => {
    expect(addTask(groups(), '   ')).toEqual(groups());
  });

  it('computes progress', () => {
    expect(progress(groups())).toEqual({ done: 1, total: 3, pct: 33 });
    expect(progress([])).toEqual({ done: 0, total: 0, pct: 0 });
  });
});
