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
import { ReorderTasks } from '../../modules/change-viewer/application/ReorderTasks';
import type { ChangeRepository } from '../../modules/change-viewer/domain/repositories/ChangeRepository';
import { FileSystemChangeRepository } from '../../modules/change-viewer/infrastructure/fs/FileSystemChangeRepository';
import { ListWorktrees } from '../../modules/worktree-management/application/ListWorktrees';
import { CreateWorktreeForChange } from '../../modules/worktree-management/application/CreateWorktreeForChange';
import { RemoveWorktree } from '../../modules/worktree-management/application/RemoveWorktree';
import { GetWorktreesActivity } from '../../modules/worktree-management/application/GetWorktreesActivity';
import type { WorktreeRepository } from '../../modules/worktree-management/domain/repositories/WorktreeRepository';
import type { AgentActivityProvider } from '../../modules/worktree-management/domain/repositories/AgentActivityProvider';
import { GitWorktreeRepository } from '../../modules/worktree-management/infrastructure/git/GitWorktreeRepository';
import { ClaudeSessionActivityProvider } from '../../modules/worktree-management/infrastructure/session/ClaudeSessionActivityProvider';

export interface AppDependencies {
  provider: ProjectsRootProvider;
  repository: ProjectRepository;
  changeRepository: ChangeRepository;
  worktreeRepository: WorktreeRepository;
  agentActivityProvider: AgentActivityProvider;
}

export class Factory {
  private constructor(private readonly dependencies: AppDependencies) {}

  static fromEnv(): Factory {
    return new Factory({
      provider: new EnvProjectsRootProvider(readProjectsPath()),
      repository: new FileSystemProjectRepository(),
      changeRepository: new FileSystemChangeRepository(),
      worktreeRepository: new GitWorktreeRepository(),
      agentActivityProvider: new ClaudeSessionActivityProvider(),
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

  reorderTasks(): ReorderTasks {
    return new ReorderTasks(this.dependencies.changeRepository);
  }

  listWorktrees(): ListWorktrees {
    return new ListWorktrees(this.dependencies.worktreeRepository, this.dependencies.changeRepository);
  }

  createWorktreeForChange(): CreateWorktreeForChange {
    return new CreateWorktreeForChange(this.dependencies.worktreeRepository, this.dependencies.changeRepository);
  }

  removeWorktree(): RemoveWorktree {
    return new RemoveWorktree(this.dependencies.worktreeRepository);
  }

  getWorktreesActivity(): GetWorktreesActivity {
    return new GetWorktreesActivity(this.dependencies.worktreeRepository, this.dependencies.agentActivityProvider);
  }
}

function readProjectsPath(): string | undefined {
  const fromImportMeta = (import.meta.env as Record<string, string | undefined>).PROJECTS_PATH;
  const fromProcess = typeof process !== 'undefined' ? process.env.PROJECTS_PATH : undefined;
  return fromImportMeta ?? fromProcess;
}

export const factory = Factory.fromEnv();
