import { DiscoveryResult } from '../domain/DiscoveryResult';
import { DomainError } from '../../../shared/domain/DomainError';
import type { Maybe } from '../../../shared/domain/Maybe';
import type { ProjectsRoot } from '../domain/ProjectsRoot';
import type { ProjectsRootProvider } from '../domain/repositories/ProjectsRootProvider';
import type { ProjectRepository } from '../domain/repositories/ProjectRepository';

export class DiscoverProjects {
  constructor(
    private readonly provider: ProjectsRootProvider,
    private readonly repository: ProjectRepository,
  ) {}

  async execute(): Promise<DiscoveryResult> {
    let root: Maybe<ProjectsRoot>;
    try {
      root = await this.provider.find();
    } catch (error) {
      return DiscoveryResult.error(messageFrom(error, 'the configured projects root'));
    }
    if (root.isNone()) {
      return DiscoveryResult.notConfigured();
    }
    const configuredRoot = root.getOrThrow();
    try {
      return DiscoveryResult.ok(await this.repository.discoverUnder(configuredRoot));
    } catch (error) {
      return DiscoveryResult.error(messageFrom(error, configuredRoot.path));
    }
  }
}

function messageFrom(error: unknown, rootPath: string): string {
  if (error instanceof DomainError) {
    return error.message;
  }
  return `Could not read projects under "${rootPath}"`;
}
