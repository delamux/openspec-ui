import { describe, it, expect } from 'vitest';
import { DiscoveryResult } from './DiscoveryResult';
import { Project } from './Project';

describe('DiscoveryResult', () => {
  it('builds a not-configured result', () => {
    expect(DiscoveryResult.notConfigured()).toEqual({ kind: 'not-configured' });
  });

  it('builds an ok result with projects', () => {
    const projects = [Project.fromDirectory('/root/app')];

    expect(DiscoveryResult.ok(projects)).toEqual({ kind: 'ok', projects });
  });

  it('builds an ok result that may be empty', () => {
    expect(DiscoveryResult.ok([])).toEqual({ kind: 'ok', projects: [] });
  });

  it('builds a discovery-error result with a message', () => {
    expect(DiscoveryResult.error('root missing')).toEqual({
      kind: 'discovery-error',
      message: 'root missing',
    });
  });
});
