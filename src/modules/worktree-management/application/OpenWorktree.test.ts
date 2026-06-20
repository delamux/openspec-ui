import { describe, it, expect } from 'vitest';
import { OpenWorktree } from './OpenWorktree';
import { InMemoryEditorLauncher } from './ports/EditorLauncher';

describe('OpenWorktree', () => {
  it('opens the worktree in the editor', async () => {
    const launcher = new InMemoryEditorLauncher();

    await new OpenWorktree(launcher).execute('/p/.claude/worktrees/add-auth');

    expect(launcher.opened).toEqual(['/p/.claude/worktrees/add-auth']);
  });
});
