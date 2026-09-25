import { describe, it, expect } from 'vitest';
import { progress, type TaskList } from './TaskList';

const list: TaskList = [
  {
    title: '1. A',
    items: [
      { id: '1.1', text: 'one', done: true, comments: [], details: '' },
      { id: '1.2', text: 'two', done: false, comments: [], details: '' },
    ],
  },
  { title: '2. B', items: [{ id: '2.1', text: 'three', done: false, comments: [], details: '' }] },
];

describe('TaskList progress', () => {
  it('computes done/total/pct', () => {
    expect(progress(list)).toEqual({ done: 1, total: 3, pct: 33 });
  });

  it('handles an empty list', () => {
    expect(progress([])).toEqual({ done: 0, total: 0, pct: 0 });
  });
});
