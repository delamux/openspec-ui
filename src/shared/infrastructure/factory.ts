import { DiscoverProjects } from '../../modules/project-discovery/application/DiscoverProjects';
import type { ProjectsRootProvider } from '../../modules/project-discovery/domain/repositories/ProjectsRootProvider';
import type { ProjectRepository } from '../../modules/project-discovery/domain/repositories/ProjectRepository';
import { EnvProjectsRootProvider } from '../../modules/project-discovery/infrastructure/env/EnvProjectsRootProvider';
import { FileSystemProjectRepository } from '../../modules/project-discovery/infrastructure/fs/FileSystemProjectRepository';
import { ListChanges } from '../../modules/change-viewer/application/ListChanges';
import { LoadChange } from '../../modules/change-viewer/application/LoadChange';
import { ToggleTask } from '../../modules/change-viewer/application/ToggleTask';
import { EditTaskText } from '../../modules/change-viewer/application/EditTaskText';
import { DeleteTask } from '../../modules/change-viewer/application/DeleteTask';
import { AddTask } from '../../modules/change-viewer/application/AddTask';
import type { ChangeRepository } from '../../modules/change-viewer/domain/repositories/ChangeRepository';
import { FileSystemChangeRepository } from '../../modules/change-viewer/infrastructure/fs/FileSystemChangeRepository';

export interface AppDependencies {
  provider: ProjectsRootProvider;
  repository: ProjectRepository;
  changeRepository: ChangeRepository;
}

export class Factory {
  private constructor(private readonly dependencies: AppDependencies) {}

  static fromEnv(): Factory {
    return new Factory({
      provider: new EnvProjectsRootProvider(readProjectsPath()),
      repository: new FileSystemProjectRepository(),
      changeRepository: new FileSystemChangeRepository(),
    });
  }

  static withDependencies(dependencies: AppDependencies): Factory {
    return new Factory(dependencies);
  }

  discoverProjects(): DiscoverProjects {
    return new DiscoverProjects(this.dependencies.provider, this.dependencies.repository);
  }

  listChanges(): ListChanges {
    return new ListChanges(this.dependencies.changeRepository);
  }

  loadChange(): LoadChange {
    return new LoadChange(this.dependencies.changeRepository);
  }

  toggleTask(): ToggleTask {
    return new ToggleTask(this.dependencies.changeRepository);
  }

  editTaskText(): EditTaskText {
    return new EditTaskText(this.dependencies.changeRepository);
  }

  deleteTask(): DeleteTask {
    return new DeleteTask(this.dependencies.changeRepository);
  }

  addTask(): AddTask {
    return new AddTask(this.dependencies.changeRepository);
  }
}

function readProjectsPath(): string | undefined {
  const fromImportMeta = (import.meta.env as Record<string, string | undefined>).PROJECTS_PATH;
  const fromProcess = typeof process !== 'undefined' ? process.env.PROJECTS_PATH : undefined;
  return fromImportMeta ?? fromProcess;
}

export const factory = Factory.fromEnv();
