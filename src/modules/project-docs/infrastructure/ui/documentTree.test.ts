import { describe, it, expect } from 'vitest';
import { buildDocumentTree } from './documentTree';

describe('buildDocumentTree', () => {
  it('is empty for no paths', () => {
    expect(buildDocumentTree([])).toEqual([]);
  });

  it('lists root files as leaves', () => {
    expect(buildDocumentTree(['README.md'])).toEqual([{ kind: 'file', name: 'README.md', path: 'README.md' }]);
  });

  it('nests files under their folders, folders before files, keeping the input order otherwise', () => {
    expect(buildDocumentTree(['CLAUDE.md', '.claude/skills/tdd/SKILL.md', '.claude/agents/review.md'])).toEqual([
      {
        kind: 'folder',
        name: '.claude',
        path: '.claude',
        children: [
          {
            kind: 'folder',
            name: 'skills',
            path: '.claude/skills',
            children: [
              {
                kind: 'folder',
                name: 'tdd',
                path: '.claude/skills/tdd',
                children: [{ kind: 'file', name: 'SKILL.md', path: '.claude/skills/tdd/SKILL.md' }],
              },
            ],
          },
          {
            kind: 'folder',
            name: 'agents',
            path: '.claude/agents',
            children: [{ kind: 'file', name: 'review.md', path: '.claude/agents/review.md' }],
          },
        ],
      },
      { kind: 'file', name: 'CLAUDE.md', path: 'CLAUDE.md' },
    ]);
  });
});
