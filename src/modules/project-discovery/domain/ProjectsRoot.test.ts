import { describe, it, expect } from 'vitest';
import { ProjectsRoot } from './ProjectsRoot';
import { DomainError } from '../../../shared/domain/DomainError';

describe('ProjectsRoot', () => {
  it('is created from an absolute path', () => {
    const root = ProjectsRoot.create('/Users/me/projects');

    expect(root.path).toBe('/Users/me/projects');
  });

  it('trims surrounding whitespace', () => {
    const root = ProjectsRoot.create('  /Users/me/projects  ');

    expect(root.path).toBe('/Users/me/projects');
  });

  it('rejects an empty path with a validation error', () => {
    expect(() => ProjectsRoot.create('   ')).toThrow(DomainError);
  });

  it('rejects a relative path with a validation error', () => {
    expect(() => ProjectsRoot.create('relative/projects')).toThrow(DomainError);
  });

  it('considers two roots with the same path equal', () => {
    const root = ProjectsRoot.create('/Users/me/projects');

    expect(root.equals(ProjectsRoot.create('/Users/me/projects'))).toBe(true);
  });
});
