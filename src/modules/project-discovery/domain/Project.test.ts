import { describe, it, expect } from 'vitest';
import { Project } from './Project';
import { DomainError } from '../../../shared/domain/DomainError';

describe('Project', () => {
  it('holds a name and an absolute path', () => {
    const project = Project.create('my-app', '/Users/me/projects/my-app');

    expect(project.name).toBe('my-app');
    expect(project.path).toBe('/Users/me/projects/my-app');
  });

  it('defaults the name to the final path segment when name is omitted', () => {
    const project = Project.fromDirectory('/Users/me/projects/my-app');

    expect(project.name).toBe('my-app');
    expect(project.path).toBe('/Users/me/projects/my-app');
  });

  it('ignores a trailing slash when deriving the name', () => {
    const project = Project.fromDirectory('/Users/me/projects/my-app/');

    expect(project.name).toBe('my-app');
  });

  it('rejects a non-absolute path', () => {
    expect(() => Project.create('x', 'relative/x')).toThrow(DomainError);
  });
});
