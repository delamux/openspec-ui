import { describe, it, expect } from 'vitest';
import { encodeWorktreePath } from './sessionPath';

describe('encodeWorktreePath', () => {
  it('encodes a plain project path the way Claude Code does', () => {
    expect(encodeWorktreePath('/home/delamux/code/openspec-ui')).toBe('-home-delamux-code-openspec-ui');
  });

  it('encodes the dot in a .claude worktree path to a double dash', () => {
    expect(encodeWorktreePath('/p/.claude/worktrees/add-auth')).toBe('-p--claude-worktrees-add-auth');
  });

  it('encodes spaces and other non-alphanumerics', () => {
    expect(encodeWorktreePath('/a b/c_d')).toBe('-a-b-c-d');
  });
});
