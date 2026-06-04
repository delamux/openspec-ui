import { Maybe } from '../../../../shared/domain/Maybe';
import type { ProjectsRoot } from '../ProjectsRoot';

export interface ProjectsRootProvider {
  find(): Promise<Maybe<ProjectsRoot>>;
}

export class InMemoryProjectsRootProvider implements ProjectsRootProvider {
  constructor(private readonly root?: ProjectsRoot) {}

  async find(): Promise<Maybe<ProjectsRoot>> {
    return Maybe.fromNullable(this.root);
  }
}
