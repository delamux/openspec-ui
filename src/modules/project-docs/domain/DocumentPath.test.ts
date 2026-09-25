import { describe, it, expect } from 'vitest';
import { DocumentPath } from './DocumentPath';
import { DomainError } from '../../../shared/domain/DomainError';

function validationErrorFor(raw: string): DomainError {
  try {
    DocumentPath.create(raw);
  } catch (error) {
    return error as DomainError;
  }
  throw new Error(`Expected ${raw} to be rejected`);
}

describe('DocumentPath', () => {
  it('accepts a markdown file at the project root', () => {
    expect(DocumentPath.create('README.md').value).toBe('README.md');
  });

  it('normalises backslashes and a leading ./', () => {
    expect(DocumentPath.create('./docs\\guide.md').value).toBe('docs/guide.md');
  });

  it('accepts .markdown files and the OpenSpec config', () => {
    expect(DocumentPath.create('notes.markdown').value).toBe('notes.markdown');
    expect(DocumentPath.create('openspec/config.yaml').value).toBe('openspec/config.yaml');
  });

  it.each(['', '   ', '/etc/passwd.md', 'C:/x.md', '../other/README.md', 'docs/../README.md', 'docs/./a.md'])(
    'rejects %j as a validation error',
    (raw) => {
      expect(validationErrorFor(raw).isValidation()).toBe(true);
    },
  );

  it.each(['package.json', 'src/index.ts', 'other/config.yaml', '.env'])('rejects the non-document %j', (raw) => {
    expect(validationErrorFor(raw).isValidation()).toBe(true);
  });

  it('exposes the file name and its format', () => {
    const skill = DocumentPath.create('.claude/skills/tdd/SKILL.md');
    expect(skill.name()).toBe('SKILL.md');
    expect(skill.format()).toBe('markdown');
    expect(DocumentPath.create('openspec/config.yaml').format()).toBe('yaml');
  });

  it.each([
    ['openspec/config.yaml', 'config'],
    ['.claude/skills/tdd/SKILL.md', 'agents'],
    ['.agents/reviewer.md', 'agents'],
    ['agents/planner.md', 'agents'],
    ['.github/copilot-instructions.md', 'agents'],
    ['CLAUDE.md', 'agents'],
    ['packages/api/AGENTS.md', 'agents'],
    ['openspec/specs/auth/spec.md', 'specs'],
    ['README.md', 'docs'],
    ['docs/agents/overview.md', 'docs'],
    ['openspec/README.md', 'docs'],
  ])('classifies %s into the %s section', (raw, section) => {
    expect(DocumentPath.create(raw).section()).toBe(section);
  });

  it('recognises README files regardless of case', () => {
    expect(DocumentPath.create('readme.md').isReadme()).toBe(true);
    expect(DocumentPath.create('docs/README.md').isReadme()).toBe(true);
    expect(DocumentPath.create('docs/guide.md').isReadme()).toBe(false);
  });
});
