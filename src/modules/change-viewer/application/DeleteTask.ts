import type { ChangeRepository } from '../domain/repositories/ChangeRepository';

export class DeleteTask {
  constructor(private readonly repository: ChangeRepository) {}

  async execute(projectPath: string, changeName: string, id: string, expectedText: string): Promise<void> {
    return this.repository.editTasks(projectPath, changeName, { kind: 'delete', id, expectedText });
  }
}
