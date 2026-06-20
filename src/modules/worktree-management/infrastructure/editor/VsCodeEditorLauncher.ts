import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DomainError } from '../../../../shared/domain/DomainError';
import type { EditorLauncher } from '../../application/ports/EditorLauncher';

const run = promisify(execFile);

export class VsCodeEditorLauncher implements EditorLauncher {
  constructor(private readonly command: string = 'code') {}

  async open(worktreePath: string): Promise<void> {
    try {
      await run(this.command, [worktreePath]);
    } catch {
      throw DomainError.create('Could not open VS Code (is the `code` command on your PATH?)');
    }
  }
}
