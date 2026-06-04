import { describe, it, expect } from 'vitest';
import { toDiscoveryResultDto } from './dtos';
import { DiscoveryResult } from '../domain/DiscoveryResult';
import { Project } from '../domain/Project';

describe('project-discovery dtos', () => {
  it('maps an ok result to plain project dtos', () => {
    const result = DiscoveryResult.ok([Project.fromDirectory('/root/app')]);

    expect(toDiscoveryResultDto(result)).toEqual({
      kind: 'ok',
      projects: [{ name: 'app', path: '/root/app' }],
    });
  });

  it('passes through not-configured and error results', () => {
    expect(toDiscoveryResultDto(DiscoveryResult.notConfigured())).toEqual({ kind: 'not-configured' });
    expect(toDiscoveryResultDto(DiscoveryResult.error('boom'))).toEqual({
      kind: 'discovery-error',
      message: 'boom',
    });
  });
});
