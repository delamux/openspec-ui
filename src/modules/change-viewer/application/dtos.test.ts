import { describe, it, expect } from 'vitest';
import { toChangeSummaryDto, toChangeViewDto } from './dtos';
import { Change } from '../domain/Change';
import { Maybe } from '../../../shared/domain/Maybe';

describe('change-viewer dtos', () => {
  it('maps a change to a summary dto', () => {
    expect(toChangeSummaryDto(Change.create('add-auth', 'archived'))).toEqual({
      name: 'add-auth',
      status: 'archived',
    });
  });

  it('maps a change detail to a view dto with progress', () => {
    const dto = toChangeViewDto({
      proposal: Maybe.some('# Why'),
      design: Maybe.none<string>(),
      tasks: Maybe.some([
        {
          title: '1. G',
          items: [
            { id: '1.1', text: 'a', done: true, comments: [] },
            { id: '1.2', text: 'b', done: false, comments: [] },
          ],
        },
      ]),
    });

    expect(dto.proposal).toBe('# Why');
    expect(dto.design).toBeNull();
    expect(dto.progress).toEqual({ done: 1, total: 2, pct: 50 });
    expect(dto.tasks?.[0].items[0].id).toBe('1.1');
  });

  it('maps an empty detail to nulls and zero progress', () => {
    const dto = toChangeViewDto({ proposal: Maybe.none(), design: Maybe.none(), tasks: Maybe.none() });

    expect(dto).toEqual({ proposal: null, design: null, tasks: null, progress: { done: 0, total: 0, pct: 0 } });
  });
});
