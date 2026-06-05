import { describe, it, expect } from 'vitest';
import { ListChanges } from './ListChanges';
import { InMemoryChangeRepository } from '../domain/repositories/ChangeRepository';
import { Change } from '../domain/Change';

describe('ListChanges', () => {
  it('returns the project changes', async () => {
    const repo = new InMemoryChangeRepository(new Map([['/p', [Change.create('a', 'active')]]]));

    expect((await new ListChanges(repo).execute('/p')).map((c) => c.name)).toEqual(['a']);
  });

  it('returns an empty list for a project with no changes', async () => {
    expect(await new ListChanges(new InMemoryChangeRepository()).execute('/p')).toEqual([]);
  });
});
