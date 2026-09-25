const TASK = /^- \[[ xX]\]\s+.*\S\s*$/;
const HEADING = /^##\s+\S/;
const COMMENT_OPEN = /^\s*<!--\s*ui:comment\b.*?-->\s*$/;
const COMMENT_CLOSE = /^\s*<!--\s*\/ui:comment\s*-->\s*$/;
const INDENTED = /^[ \t]+\S/;

// Index of the line closing the ui:comment opened at `open`, or -1 when it is unterminated:
// a heading, task, or new comment-open ends the search so it never swallows them.
export function commentCloseIndex(lines: string[], open: number): number {
  for (let scan = open + 1; scan < lines.length; scan++) {
    if (COMMENT_CLOSE.test(lines[scan])) {
      return scan;
    }
    if (HEADING.test(lines[scan]) || TASK.test(lines[scan]) || COMMENT_OPEN.test(lines[scan])) {
      return -1;
    }
  }
  return -1;
}

// Index just past everything that belongs to the task line at `taskIndex`: indented lines
// (wrapped text, code blocks), terminated ui:comment blocks, and the blank lines between them.
// Trailing blank lines and an unterminated comment are left outside the block.
export function endOfTaskBlock(lines: string[], taskIndex: number): number {
  let end = taskIndex + 1;
  let scan = taskIndex + 1;
  while (scan < lines.length) {
    const line = lines[scan];
    if (COMMENT_OPEN.test(line)) {
      const close = commentCloseIndex(lines, scan);
      if (close === -1) {
        return end;
      }
      scan = close + 1;
      end = scan;
      continue;
    }
    if (INDENTED.test(line)) {
      scan += 1;
      end = scan;
      continue;
    }
    if (line.trim() !== '') {
      return end;
    }
    scan += 1;
  }
  return end;
}

export function isCommentOpen(line: string): boolean {
  return COMMENT_OPEN.test(line);
}
