import { describe, it, expect } from 'vitest';
import { parseTasks } from './parseTasks';

describe('parseTasks', () => {
  it('parses grouped, numbered tasks with done state in order', () => {
    const md = ['## 1. Setup', '', '- [x] 1.1 Do thing', '- [ ] 1.2 Other thing'].join('\n');

    const list = parseTasks(md);

    expect(list).toEqual([
      {
        title: '1. Setup',
        items: [
          { id: '1.1', text: 'Do thing', done: true, comments: [] },
          { id: '1.2', text: 'Other thing', done: false, comments: [] },
        ],
      },
    ]);
  });

  it('keeps multiple groups in order', () => {
    const md = ['## 1. A', '- [ ] 1.1 a', '## 2. B', '- [x] 2.1 b'].join('\n');

    expect(parseTasks(md).map((g) => g.title)).toEqual(['1. A', '2. B']);
  });

  it('handles a task without a numeric id token', () => {
    const list = parseTasks('## 1. G\n- [ ] just text');

    expect(list[0].items[0]).toEqual({ id: '', text: 'just text', done: false, comments: [] });
  });

  it('parses inline ui:comment blocks attached to the task above', () => {
    const md = [
      '## 1. G',
      '- [ ] 1.1 Implement redeem()',
      '  <!-- ui:comment author="Priya N." at="2026-06-03T10:00:00Z" -->',
      '  Burn the jti in Redis.',
      '  <!-- /ui:comment -->',
    ].join('\n');

    const task = parseTasks(md)[0].items[0];

    expect(task.comments).toEqual([
      { author: 'Priya N.', at: '2026-06-03T10:00:00Z', text: 'Burn the jti in Redis.' },
    ]);
  });

  it('parses multiple comments on one task', () => {
    const md = [
      '## 1. G',
      '- [ ] 1.1 t',
      '<!-- ui:comment author="A" at="t1" -->',
      'first',
      '<!-- /ui:comment -->',
      '<!-- ui:comment author="B" at="t2" -->',
      'second',
      '<!-- /ui:comment -->',
    ].join('\n');

    expect(parseTasks(md)[0].items[0].comments.map((c) => c.text)).toEqual(['first', 'second']);
  });

  it('is tolerant: ignores unrecognized lines and returns [] for empty input', () => {
    expect(parseTasks('')).toEqual([]);
    expect(parseTasks('   \nrandom prose\n')).toEqual([]);
  });

  it('does not let an unterminated ui:comment swallow following tasks', () => {
    const md = [
      '## 1. G',
      '- [ ] 1.1 first',
      '<!-- ui:comment author="A" at="t" -->',
      'a dangling comment with no close marker',
      '## 2. H',
      '- [x] 2.1 second',
    ].join('\n');

    const list = parseTasks(md);

    expect(list.map((g) => g.title)).toEqual(['1. G', '2. H']);
    expect(list[0].items[0].comments).toEqual([]);
    expect(list[1].items[0]).toMatchObject({ id: '2.1', done: true });
  });

  it('normalizes CRLF line endings', () => {
    const list = parseTasks('## 1. G\r\n- [x] 1.1 done\r\n');

    expect(list[0].items[0]).toEqual({ id: '1.1', text: 'done', done: true, comments: [] });
  });

  it('places a task before any heading into an untitled group', () => {
    const list = parseTasks('- [ ] orphan task');

    expect(list).toEqual([{ title: '', items: [{ id: '', text: 'orphan task', done: false, comments: [] }] }]);
  });

  it('treats an uppercase X as done and ignores unrecognized markers', () => {
    const list = parseTasks('## 1. G\n- [X] 1.1 done\n- [~] 1.2 weird');

    expect(list[0].items).toEqual([{ id: '1.1', text: 'done', done: true, comments: [] }]);
  });

  it('reads unquoted comment attributes', () => {
    const md = ['## 1. G', '- [ ] 1.1 t', '<!-- ui:comment author=bob at=now -->', 'hi', '<!-- /ui:comment -->'].join('\n');

    expect(parseTasks(md)[0].items[0].comments[0]).toMatchObject({ author: 'bob', at: 'now', text: 'hi' });
  });

  it('ignores a ui:comment block that precedes any task', () => {
    const md = ['<!-- ui:comment author="A" at="t" -->', 'orphan', '<!-- /ui:comment -->', '## 1. G', '- [ ] 1.1 t'].join('\n');

    const list = parseTasks(md);
    expect(list).toHaveLength(1);
    expect(list[0].items[0].comments).toEqual([]);
  });

  it('exposes an empty comment list for a task without comments', () => {
    expect(parseTasks('## 1. G\n- [ ] 1.1 t')[0].items[0].comments).toEqual([]);
  });
});
