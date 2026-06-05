import type { Change } from '../domain/Change';
import type { ChangeRepository } from '../domain/repositories/ChangeRepository';

export class ListChanges {
  constructor(private readonly repository: ChangeRepository) {}

  async execute(projectPath: string): Promise<Change[]> {
    return this.repository.listChanges(projectPath);
  }
}
