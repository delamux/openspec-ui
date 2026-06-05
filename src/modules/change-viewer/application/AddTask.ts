import type { ChangeRepository } from '../domain/repositories/ChangeRepository';

export class AddTask {
  constructor(private readonly repository: ChangeRepository) {}

  async execute(projectPath: string, changeName: string, text: string): Promise<void> {
    return this.repository.editTasks(projectPath, changeName, { kind: 'add', text });
  }
}
