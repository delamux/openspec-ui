import type { ChangeRepository } from '../domain/repositories/ChangeRepository';

export class EditTaskText {
  constructor(private readonly repository: ChangeRepository) {}

  async execute(
    projectPath: string,
    changeName: string,
    id: string,
    expectedText: string,
    newText: string,
  ): Promise<void> {
    return this.repository.editTasks(projectPath, changeName, { kind: 'edit-text', id, expectedText, newText });
  }
}
