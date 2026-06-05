import { describe, it, expect } from 'vitest';
import { ToggleTask } from './ToggleTask';
import { EditTaskText } from './EditTaskText';
import { DeleteTask } from './DeleteTask';
import { AddTask } from './AddTask';
import { InMemoryChangeRepository } from '../domain/repositories/ChangeRepository';
import type { ChangeDetail } from '../domain/ChangeDetail';
import { Maybe } from '../../../shared/domain/Maybe';
import { DomainError } from '../../../shared/domain/DomainError';

function repoWith(items: { id: string; text: string; done: boolean }[]) {
  const detail: ChangeDetail = {
    proposal: Maybe.none<string>(),
    design: Maybe.none<string>(),
    tasks: Maybe.some([{ title: '1. G', items: items.map((i) => ({ ...i, comments: [] })) }]),
  };
  return new InMemoryChangeRepository(new Map(), new Map([['/p::c', detail]]));
}

async function tasksOf(repo: InMemoryChangeRepository) {
  return (await repo.loadChange('/p', 'c')).tasks.getOrThrow()[0].items;
}

describe('task edit use cases', () => {
  it('ToggleTask flips done', async () => {
    const repo = repoWith([{ id: '1.1', text: 'a', done: false }]);

    await new ToggleTask(repo).execute('/p', 'c', '1.1', 'a');

    expect((await tasksOf(repo))[0].done).toBe(true);
  });

  it('EditTaskText changes the text', async () => {
    const repo = repoWith([{ id: '1.1', text: 'a', done: false }]);

    await new EditTaskText(repo).execute('/p', 'c', '1.1', 'a', 'b');

    expect((await tasksOf(repo))[0].text).toBe('b');
  });

  it('DeleteTask removes the task', async () => {
    const repo = repoWith([{ id: '1.1', text: 'a', done: false }]);

    await new DeleteTask(repo).execute('/p', 'c', '1.1', 'a');

    expect(await tasksOf(repo)).toEqual([]);
  });

  it('AddTask appends a new task with a derived id', async () => {
    const repo = repoWith([{ id: '1.1', text: 'a', done: false }]);

    await new AddTask(repo).execute('/p', 'c', 'b');

    expect(await tasksOf(repo)).toHaveLength(2);
    expect((await tasksOf(repo))[1]).toMatchObject({ id: '1.2', text: 'b', done: false });
  });

  it('propagates a conflict from a stale edit', async () => {
    const repo = repoWith([{ id: '1.1', text: 'a', done: false }]);

    await expect(new ToggleTask(repo).execute('/p', 'c', '1.1', 'stale')).rejects.toBeInstanceOf(DomainError);
  });
});
