import { describe, it, expect } from 'vitest';
import { highlightCode } from './highlightCode';

describe('highlightCode', () => {
  it('escapes HTML when no language is given', () => {
    const html = highlightCode('<script>alert(1)</script>', '');

    expect(html).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes HTML when the language is unknown', () => {
    const html = highlightCode('<script>alert(1)</script>', 'not-a-language');

    expect(html).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('highlights TypeScript keywords', () => {
    const html = highlightCode('const x = 1;', 'typescript');

    expect(html).toContain('hljs-keyword');
    expect(html).toContain('const');
    expect(html).not.toContain('<script>');
  });

  it('accepts the ts language alias', () => {
    const html = highlightCode('const x = 1;', 'ts');

    expect(html).toContain('hljs-keyword');
  });

  it('escapes HTML inside highlighted code', () => {
    const html = highlightCode('const x = "<script>";', 'typescript');

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
