import { Maybe } from '../../../../shared/domain/Maybe';
import { ProjectsRoot } from '../../domain/ProjectsRoot';
import type { ProjectsRootProvider } from '../../domain/repositories/ProjectsRootProvider';

export class EnvProjectsRootProvider implements ProjectsRootProvider {
  constructor(private readonly rawPath: string | undefined) {}

  async find(): Promise<Maybe<ProjectsRoot>> {
    const value = (this.rawPath ?? '').trim();
    if (value.length === 0) {
      return Maybe.none();
    }
    return Maybe.some(ProjectsRoot.create(value));
  }
}
