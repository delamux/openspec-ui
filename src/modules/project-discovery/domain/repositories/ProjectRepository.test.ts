import { describe, it, expect } from 'vitest';
import { InMemoryProjectRepository } from './ProjectRepository';
import { Project } from '../Project';
import { ProjectsRoot } from '../ProjectsRoot';

describe('InMemoryProjectRepository', () => {
  it('returns the projects it was seeded with', async () => {
    const project = Project.fromDirectory('/Users/me/projects/app');
    const repository = new InMemoryProjectRepository([project]);

    const found = await repository.discoverUnder(ProjectsRoot.create('/Users/me/projects'));

    expect(found).toEqual([project]);
  });

  it('returns an empty list when seeded with none', async () => {
    const repository = new InMemoryProjectRepository();

    const found = await repository.discoverUnder(ProjectsRoot.create('/Users/me/projects'));

    expect(found).toEqual([]);
  });
});
