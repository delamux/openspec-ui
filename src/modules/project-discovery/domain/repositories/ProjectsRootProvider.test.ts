import { describe, it, expect } from 'vitest';
import { InMemoryProjectsRootProvider } from './ProjectsRootProvider';
import { ProjectsRoot } from '../ProjectsRoot';

describe('InMemoryProjectsRootProvider', () => {
  it('returns none when no root is provided', async () => {
    const provider = new InMemoryProjectsRootProvider();

    expect((await provider.find()).isNone()).toBe(true);
  });

  it('returns the provided root', async () => {
    const provider = new InMemoryProjectsRootProvider(ProjectsRoot.create('/Users/me/projects'));

    expect((await provider.find()).getOrThrow().path).toBe('/Users/me/projects');
  });
});
