import type { ChangeRepository } from '../domain/repositories/ChangeRepository';

export class ReorderTasks {
  constructor(private readonly repository: ChangeRepository) {}

  async execute(projectPath: string, changeName: string, groupTitle: string, orderedIds: string[]): Promise<void> {
    return this.repository.editTasks(projectPath, changeName, { kind: 'reorder', groupTitle, orderedIds });
  }
}
