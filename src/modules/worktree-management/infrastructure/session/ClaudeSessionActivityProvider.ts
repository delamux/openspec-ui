import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Maybe } from '../../../../shared/domain/Maybe';
import { noSessionActivity, type AgentActivity } from '../../domain/AgentActivity';
import type { AgentActivityProvider } from '../../domain/repositories/AgentActivityProvider';
import { encodeWorktreePath } from './sessionPath';
import { deriveActivity } from './deriveActivity';

export class ClaudeSessionActivityProvider implements AgentActivityProvider {
  constructor(
    private readonly projectsRoot: string = join(homedir(), '.claude', 'projects'),
    private readonly now: () => number = () => Date.now(),
  ) {}

  async activityFor(worktreePath: string): Promise<AgentActivity> {
    const dir = join(this.projectsRoot, encodeWorktreePath(worktreePath));
    const latest = await latestJsonl(dir);
    if (latest.isNone()) {
      return noSessionActivity();
    }
    const content = await readFile(latest.getOrThrow(), 'utf8');
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    return deriveActivity(lines, this.now());
  }
}

async function latestJsonl(dir: string): Promise<Maybe<string>> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return Maybe.none<string>();
  }
  let best = Maybe.none<string>();
  let bestMtime = -1;
  for (const name of entries) {
    if (!name.endsWith('.jsonl')) {
      continue;
    }
    const full = join(dir, name);
    const mtime = (await stat(full)).mtimeMs;
    if (mtime > bestMtime) {
      bestMtime = mtime;
      best = Maybe.some(full);
    }
  }
  return best;
}
