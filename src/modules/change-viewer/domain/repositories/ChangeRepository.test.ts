import { describe, it, expect } from 'vitest';
import { InMemoryChangeRepository } from './ChangeRepository';
import { Change } from '../Change';
import type { ChangeDetail } from '../ChangeDetail';
import { Maybe } from '../../../../shared/domain/Maybe';

describe('InMemoryChangeRepository', () => {
  it('lists the changes seeded for a project', async () => {
    const repo = new InMemoryChangeRepository(
      new Map([['/p', [Change.create('a', 'active'), Change.create('b', 'archived')]]]),
    );

    const changes = await repo.listChanges('/p');

    expect(changes.map((c) => c.name)).toEqual(['a', 'b']);
  });

  it('returns an empty list for an unknown project', async () => {
    expect(await new InMemoryChangeRepository().listChanges('/none')).toEqual([]);
  });

  it('returns the seeded detail for a change', async () => {
    const detail: ChangeDetail = { proposal: Maybe.some('# hi'), design: Maybe.none<string>(), tasks: Maybe.none() };
    const repo = new InMemoryChangeRepository(new Map(), new Map([['/p::a', detail]]));

    expect((await repo.loadChange('/p', 'a')).proposal.getOrThrow()).toBe('# hi');
  });

  it('returns an empty detail for an unknown change', async () => {
    const detail = await new InMemoryChangeRepository().loadChange('/p', 'x');

    expect(detail.proposal.isNone()).toBe(true);
    expect(detail.tasks.isNone()).toBe(true);
  });
});
