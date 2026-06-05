import { Maybe } from '../../../../shared/domain/Maybe';
import type { Change } from '../Change';
import type { ChangeDetail } from '../ChangeDetail';

export interface ChangeRepository {
  listChanges(projectPath: string): Promise<Change[]>;
  loadChange(projectPath: string, changeName: string): Promise<ChangeDetail>;
}

const emptyDetail: ChangeDetail = {
  proposal: Maybe.none<string>(),
  design: Maybe.none<string>(),
  tasks: Maybe.none(),
};

export class InMemoryChangeRepository implements ChangeRepository {
  constructor(
    private readonly changesByProject: Map<string, Change[]> = new Map(),
    private readonly detailsByChange: Map<string, ChangeDetail> = new Map(),
  ) {}

  async listChanges(projectPath: string): Promise<Change[]> {
    return this.changesByProject.get(projectPath) ?? [];
  }

  async loadChange(projectPath: string, changeName: string): Promise<ChangeDetail> {
    return this.detailsByChange.get(`${projectPath}::${changeName}`) ?? emptyDetail;
  }
}
