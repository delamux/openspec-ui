import { cp, mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  AgentTaskScaffolder,
  AgentTaskScaffolderInput,
} from '../../application/ports/AgentTaskScaffolder';

const COPIED_ASSETS = ['skills', 'agents'];

export class FileSystemAgentTaskScaffolder implements AgentTaskScaffolder {
  async scaffold(input: AgentTaskScaffolderInput): Promise<void> {
    await this.copyClaudeAssets(input.projectPath, input.worktreePath);
    await writeFile(join(input.worktreePath, 'CLAUDE_TASK.md'), taskPrompt(input.changeName), 'utf8');
    await this.writeVsCodeTask(input.worktreePath);
  }

  private async copyClaudeAssets(projectPath: string, worktreePath: string): Promise<void> {
    for (const asset of COPIED_ASSETS) {
      const source = join(projectPath, '.claude', asset);
      if (await exists(source)) {
        await cp(source, join(worktreePath, '.claude', asset), { recursive: true });
      }
    }
  }

  private async writeVsCodeTask(worktreePath: string): Promise<void> {
    const dir = join(worktreePath, '.vscode');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'tasks.json'), `${JSON.stringify(vscodeTasks(), null, 2)}\n`, 'utf8');
  }
}

function taskPrompt(changeName: string): string {
  return [
    '# Agent task',
    '',
    `Use the \`openspec-apply-change\` skill to implement the OpenSpec change **${changeName}** in this worktree.`,
    '',
    `Work through \`openspec/changes/${changeName}/tasks.md\` one task at a time, following the project's`,
    'TDD rules (red → green → refactor). Mark each task `- [ ]` → `- [x]` as you complete it, and pause',
    'if anything is unclear.',
    '',
  ].join('\n');
}

function vscodeTasks(): unknown {
  return {
    version: '2.0.0',
    tasks: [
      {
        label: 'Start Claude (apply change)',
        type: 'shell',
        command: 'claude',
        args: ['Read CLAUDE_TASK.md and follow the instructions in it.'],
        runOptions: { runOn: 'folderOpen' },
        presentation: { reveal: 'always', panel: 'dedicated' },
        problemMatcher: [],
      },
    ],
  };
}

async function exists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}
