import { describe, it, expect } from 'vitest';
import { LoadChange } from './LoadChange';
import { InMemoryChangeRepository } from '../domain/repositories/ChangeRepository';
import { Maybe } from '../../../shared/domain/Maybe';

describe('LoadChange', () => {
  it('returns the change detail', async () => {
    const detail = {
      proposal: Maybe.some('# Why'),
      design: Maybe.none<string>(),
      tasks: Maybe.some([{ title: '1. G', items: [] }]),
    };
    const repo = new InMemoryChangeRepository(new Map(), new Map([['/p::a', detail]]));

    const loaded = await new LoadChange(repo).execute('/p', 'a');

    expect(loaded.proposal.getOrThrow()).toBe('# Why');
    expect(loaded.design.isNone()).toBe(true);
  });
});
