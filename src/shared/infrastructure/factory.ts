import { DiscoverProjects } from '../../modules/project-discovery/application/DiscoverProjects';
import type { ProjectsRootProvider } from '../../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import type { ProjectRepository } from '../../modules/project-discovery/domain/repositories/ProjectRepository';
import { EnvProjectsRootProvider } from '../../modules/project-discovery/infrastructure/env/EnvProjectsRootProvider';
import { FileSystemProjectRepository } from '../../modules/project-discovery/infrastructure/fs/FileSystemProjectRepository';

export interface ProjectDiscoveryDependencies {
  provider: ProjectsRootProvider;
  repository: ProjectRepository;
}

export class Factory {
  private constructor(private readonly dependencies: ProjectDiscoveryDependencies) {}

  static fromEnv(): Factory {
    return new Factory({
      provider: new EnvProjectsRootProvider(readProjectsPath()),
      repository: new FileSystemProjectRepository(),
    });
  }

  static withDependencies(dependencies: ProjectDiscoveryDependencies): Factory {
    return new Factory(dependencies);
  }

  discoverProjects(): DiscoverProjects {
    return new DiscoverProjects(this.dependencies.provider, this.dependencies.repository);
  }
}

function readProjectsPath(): string | undefined {
  const fromImportMeta = (import.meta.env as Record<string, string | undefined>).PROJECTS_PATH;
  const fromProcess = typeof process !== 'undefined' ? process.env.PROJECTS_PATH : undefined;
  return fromImportMeta ?? fromProcess;
}

export const factory = Factory.fromEnv();
