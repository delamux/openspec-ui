import { describe, it, expect } from 'vitest';
import { applyTaskEdit } from './applyTaskEdit';
import { DomainError } from '../../../../shared/domain/DomainError';

const FIXTURE = [
  '## 1. Setup',
  '',
  '- [x] 1.1 Add `vitest`',
  '- [ ] 1.2 Wire config',
  '',
  '## 2. Build',
  '',
  '- [ ] 2.1 First thing',
  '  <!-- ui:comment author="A" at="t" -->',
  '  needs care',
  '  <!-- /ui:comment -->',
  '- [x] 2.2 Second thing',
  '',
].join('\n');

function changedLines(before: string, after: string): number[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const changed: number[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) changed.push(i);
  }
  return changed;
}

describe('applyTaskEdit — toggle', () => {
  it('checks an open task, changing only that line', () => {
    const out = applyTaskEdit(FIXTURE, { kind: 'toggle', id: '1.2', expectedText: 'Wire config' });

    expect(out.split('\n')[3]).toBe('- [x] 1.2 Wire config');
    expect(changedLines(FIXTURE, out)).toEqual([3]);
  });

  it('unchecks a done task', () => {
    const out = applyTaskEdit(FIXTURE, { kind: 'toggle', id: '1.1', expectedText: 'Add `vitest`' });

    expect(out.split('\n')[2]).toBe('- [ ] 1.1 Add `vitest`');
    expect(changedLines(FIXTURE, out)).toEqual([2]);
  });

  it('treats an uppercase [X] as done', () => {
    const out = applyTaskEdit('## 1. G\n- [X] 1.1 t', { kind: 'toggle', id: '1.1', expectedText: 't' });

    expect(out).toBe('## 1. G\n- [ ] 1.1 t');
  });
});

describe('applyTaskEdit — edit-text', () => {
  it('replaces only the text, preserving checkbox and id', () => {
    const out = applyTaskEdit(FIXTURE, {
      kind: 'edit-text',
      id: '1.1',
      expectedText: 'Add `vitest`',
      newText: 'Add vitest and `vitest.config.ts`',
    });

    expect(out.split('\n')[2]).toBe('- [x] 1.1 Add vitest and `vitest.config.ts`');
    expect(changedLines(FIXTURE, out)).toEqual([2]);
  });

  it('rejects empty new text', () => {
    expect(() =>
      applyTaskEdit(FIXTURE, { kind: 'edit-text', id: '1.2', expectedText: 'Wire config', newText: '  ' }),
    ).toThrow(DomainError);
  });
});

describe('applyTaskEdit — delete', () => {
  it('removes a task and its trailing comment block', () => {
    const out = applyTaskEdit(FIXTURE, { kind: 'delete', id: '2.1', expectedText: 'First thing' });

    expect(out).not.toContain('2.1 First thing');
    expect(out).not.toContain('needs care');
    expect(out).toContain('- [x] 2.2 Second thing');
    expect(out.split('\n').slice(0, 6).join('\n')).toBe(FIXTURE.split('\n').slice(0, 6).join('\n'));
  });

  it('removes only the line for a task without comments', () => {
    const out = applyTaskEdit(FIXTURE, { kind: 'delete', id: '1.2', expectedText: 'Wire config' });

    expect(out.split('\n')).not.toContain('- [ ] 1.2 Wire config');
    expect(out.split('\n')[2]).toBe('- [x] 1.1 Add `vitest`');
    expect(out.split('\n')[3]).toBe('');
  });

  it('does not over-delete when a comment block is unterminated', () => {
    const md = ['## 1. G', '- [ ] 1.1 t', '<!-- ui:comment author="A" at="t" -->', 'dangling', '## 2. H', '- [x] 2.1 u'].join('\n');

    const out = applyTaskEdit(md, { kind: 'delete', id: '1.1', expectedText: 't' });

    expect(out).toContain('## 2. H');
    expect(out).toContain('- [x] 2.1 u');
    expect(out).toContain('dangling');
  });
});

describe('applyTaskEdit — add', () => {
  it('appends to the named group with an auto-derived id', () => {
    const out = applyTaskEdit(FIXTURE, { kind: 'add', groupTitle: '2. Build', text: 'Wire up CI' });
    const lines = out.split('\n');
    const idx = lines.indexOf('- [x] 2.2 Second thing');

    expect(lines[idx + 1]).toBe('- [ ] 2.3 Wire up CI');
  });

  it('adds to a non-last group, inside its section', () => {
    const out = applyTaskEdit(FIXTURE, { kind: 'add', groupTitle: '1. Setup', text: 'Lint setup' });
    const lines = out.split('\n');

    expect(lines).toContain('- [ ] 1.3 Lint setup');
    // inserted before the next section heading
    expect(lines.indexOf('- [ ] 1.3 Lint setup')).toBeLessThan(lines.indexOf('## 2. Build'));
  });

  it('auto-numbers from the max existing sub-id, avoiding collisions after a delete', () => {
    const md = '## 1. G\n- [ ] 1.1 a\n- [ ] 1.3 c\n';
    const out = applyTaskEdit(md, { kind: 'add', groupTitle: '1. G', text: 'd' });

    expect(out).toContain('- [ ] 1.4 d');
  });

  it('ignores blank text', () => {
    expect(() => applyTaskEdit(FIXTURE, { kind: 'add', groupTitle: '1. Setup', text: '   ' })).toThrow(DomainError);
  });

  it('throws not-found for an unknown group', () => {
    expect(() => applyTaskEdit(FIXTURE, { kind: 'add', groupTitle: '9. Nope', text: 'x' })).toThrow(DomainError);
  });

  it('adds with a trailing-newline file and keeps it', () => {
    const out = applyTaskEdit('## 8. Verify\n\n- [ ] 8.1 a\n', { kind: 'add', groupTitle: '8. Verify', text: 'b' });

    expect(out).toBe('## 8. Verify\n\n- [ ] 8.1 a\n- [ ] 8.2 b\n');
  });
});

describe('applyTaskEdit — locator guard', () => {
  it('throws a conflict when the on-disk text drifted', () => {
    let caught: unknown;
    try {
      applyTaskEdit(FIXTURE, { kind: 'toggle', id: '1.1', expectedText: 'stale text' });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(DomainError);
    expect((caught as DomainError).isConflict()).toBe(true);
  });

  it('throws not-found for an unknown id', () => {
    expect(() => applyTaskEdit(FIXTURE, { kind: 'toggle', id: '9.9', expectedText: 'x' })).toThrow(DomainError);
  });
});

describe('applyTaskEdit — line endings', () => {
  it('preserves CRLF line endings', () => {
    const md = '## 1. G\r\n- [ ] 1.1 done\r\n';
    const out = applyTaskEdit(md, { kind: 'toggle', id: '1.1', expectedText: 'done' });

    expect(out).toBe('## 1. G\r\n- [x] 1.1 done\r\n');
  });
});
