export interface EditorLauncher {
  open(worktreePath: string): Promise<void>;
}

export class InMemoryEditorLauncher implements EditorLauncher {
  readonly opened: string[] = [];

  async open(worktreePath: string): Promise<void> {
    this.opened.push(worktreePath);
  }
}
