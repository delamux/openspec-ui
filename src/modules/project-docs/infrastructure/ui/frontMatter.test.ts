import { describe, it, expect } from 'vitest';
import { splitFrontMatter } from './frontMatter';

describe('splitFrontMatter', () => {
  it('returns the whole source as body when there is no front matter', () => {
    expect(splitFrontMatter('# Title\n\ntext')).toEqual({ frontMatter: null, body: '# Title\n\ntext' });
  });

  it('separates a leading YAML block from the body', () => {
    expect(splitFrontMatter('---\nname: tdd\ndescription: x\n---\n# TDD\n')).toEqual({
      frontMatter: 'name: tdd\ndescription: x',
      body: '# TDD\n',
    });
  });

  it('handles CRLF line endings', () => {
    expect(splitFrontMatter('---\r\nname: tdd\r\n---\r\nbody')).toEqual({ frontMatter: 'name: tdd', body: 'body' });
  });

  it('leaves an unterminated block alone', () => {
    expect(splitFrontMatter('---\nname: tdd\n# no end')).toEqual({ frontMatter: null, body: '---\nname: tdd\n# no end' });
  });

  it('does not treat a horizontal rule later in the document as front matter', () => {
    expect(splitFrontMatter('# T\n---\nx\n---\n')).toEqual({ frontMatter: null, body: '# T\n---\nx\n---\n' });
  });
});
