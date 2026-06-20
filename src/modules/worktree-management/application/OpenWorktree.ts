import type { EditorLauncher } from './ports/EditorLauncher';

export class OpenWorktree {
  constructor(private readonly launcher: EditorLauncher) {}

  async execute(worktreePath: string): Promise<void> {
    await this.launcher.open(worktreePath);
  }
}
