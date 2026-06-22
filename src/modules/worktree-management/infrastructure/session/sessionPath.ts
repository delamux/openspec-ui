// Claude Code names a worktree's session folder under ~/.claude/projects/ by
// replacing every non-alphanumeric character of the absolute path with '-'
// (slashes, dots, and spaces all become '-', including the leading slash).
export function encodeWorktreePath(worktreePath: string): string {
  return worktreePath.replace(/[^a-zA-Z0-9]/g, '-');
}
