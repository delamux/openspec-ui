import type { ChangeDetail } from '../domain/ChangeDetail';
import type { ChangeRepository } from '../domain/repositories/ChangeRepository';

export class LoadChange {
  constructor(private readonly repository: ChangeRepository) {}

  async execute(projectPath: string, changeName: string): Promise<ChangeDetail> {
    return this.repository.loadChange(projectPath, changeName);
  }
}
