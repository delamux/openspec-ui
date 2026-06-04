import { Project } from '../Project';
import { ProjectsRoot } from '../ProjectsRoot';

export interface ProjectRepository {
  discoverUnder(root: ProjectsRoot): Promise<Project[]>;
}

export class InMemoryProjectRepository implements ProjectRepository {
  constructor(private readonly projects: Project[] = []) {}

  async discoverUnder(_root: ProjectsRoot): Promise<Project[]> {
    return this.projects;
  }
}
