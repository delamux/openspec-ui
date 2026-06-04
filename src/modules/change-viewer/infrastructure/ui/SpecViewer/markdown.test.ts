import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders headings at the right level', () => {
    expect(renderMarkdown('## Why')).toBe('<h2>Why</h2>');
    expect(renderMarkdown('### Goals')).toBe('<h3>Goals</h3>');
  });

  it('renders bold and inline code', () => {
    expect(renderMarkdown('a **bold** and `code` word')).toBe(
      '<p>a <strong>bold</strong> and <code>code</code> word</p>',
    );
  });

  it('escapes HTML in content', () => {
    expect(renderMarkdown('<script>')).toBe('<p>&lt;script&gt;</p>');
  });

  it('renders fenced code blocks without inline formatting', () => {
    expect(renderMarkdown('```\nconst x = 1;\n```')).toBe('<pre><code>const x = 1;</code></pre>');
  });

  it('renders blockquotes', () => {
    expect(renderMarkdown('> note here')).toBe('<blockquote><p>note here</p></blockquote>');
  });

  it('renders unordered and ordered lists', () => {
    expect(renderMarkdown('- one\n- two')).toBe('<ul><li>one</li><li>two</li></ul>');
    expect(renderMarkdown('1. first\n2. second')).toBe('<ol><li>first</li><li>second</li></ol>');
  });

  it('renders pipe tables', () => {
    const md = '| Area | Effect |\n| --- | --- |\n| Onboarding | Removes step |';
    expect(renderMarkdown(md)).toBe(
      '<table><thead><tr><th>Area</th><th>Effect</th></tr></thead>' +
        '<tbody><tr><td>Onboarding</td><td>Removes step</td></tr></tbody></table>',
    );
  });

  it('joins wrapped paragraph lines', () => {
    expect(renderMarkdown('line one\nline two')).toBe('<p>line one line two</p>');
  });
});
