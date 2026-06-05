import { DomainError } from '../../../../shared/domain/DomainError';
import type { TaskEdit } from '../../domain/TaskEdit';

export type { TaskEdit };

const TASK = /^- \[[ xX]\]\s+.*\S\s*$/;
const HEADING = /^##\s+\S/;
const COMMENT_OPEN = /^\s*<!--\s*ui:comment\b.*?-->\s*$/;
const COMMENT_CLOSE = /^\s*<!--\s*\/ui:comment\s*-->\s*$/;

interface ParsedLine {
  id: string;
  text: string;
}

function parseTaskLine(line: string): ParsedLine | null {
  const task = /^- \[[ xX]\]\s+(.*\S)\s*$/.exec(line);
  if (task === null) {
    return null;
  }
  const withId = /^(\d+(?:\.\d+)*)\s+(.*)$/.exec(task[1]);
  return withId ? { id: withId[1], text: withId[2] } : { id: '', text: task[1] };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function locate(lines: string[], id: string, expectedText: string): number {
  let sawId = false;
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseTaskLine(lines[i]);
    if (parsed !== null && parsed.id !== '' && parsed.id === id) {
      if (parsed.text === expectedText) {
        return i;
      }
      sawId = true;
    }
  }
  if (sawId) {
    throw DomainError.createConflict(`Task ${id} changed on disk since it was loaded; reload the change`);
  }
  throw DomainError.createNotFound(`Task not found: ${id}`);
}

// Index just past a task's trailing ui:comment block(s); leaves an unterminated block in place.
function endOfCommentBlock(lines: string[], from: number): number {
  let end = from;
  while (end < lines.length && COMMENT_OPEN.test(lines[end])) {
    let scan = end + 1;
    let closed = false;
    while (scan < lines.length) {
      if (COMMENT_CLOSE.test(lines[scan])) {
        closed = true;
        break;
      }
      if (TASK.test(lines[scan]) || HEADING.test(lines[scan])) {
        break;
      }
      scan++;
    }
    if (!closed) {
      break;
    }
    end = scan + 1;
  }
  return end;
}

export function applyTaskEdit(raw: string, edit: TaskEdit): string {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);

  if (edit.kind === 'add') {
    insertTaskInGroup(lines, edit.groupTitle, edit.text);
    return lines.join(eol);
  }

  const index = locate(lines, edit.id, edit.expectedText);

  if (edit.kind === 'toggle') {
    const current = /^- \[([ xX])\]/.exec(lines[index])![1];
    const next = current.toLowerCase() === 'x' ? ' ' : 'x';
    lines[index] = lines[index].replace(/^(- \[)[ xX](\])/, `$1${next}$2`);
    return lines.join(eol);
  }

  if (edit.kind === 'edit-text') {
    const newText = edit.newText.trim();
    if (newText.length === 0) {
      throw DomainError.createValidation('Task text must not be empty');
    }
    const prefix = new RegExp(`^(- \\[[ xX]\\]\\s+${escapeRegExp(edit.id)}\\s+).*$`);
    lines[index] = lines[index].replace(prefix, `$1${newText}`);
    return lines.join(eol);
  }

  // delete: remove the task line and its attached comment block(s)
  const blockEnd = endOfCommentBlock(lines, index + 1);
  lines.splice(index, blockEnd - index);
  return lines.join(eol);
}

const HEADING_TITLE = /^##\s+(.*\S)\s*$/;

function insertTaskInGroup(lines: string[], groupTitle: string, rawText: string): void {
  const text = rawText.trim();
  if (text.length === 0) {
    throw DomainError.createValidation('Task text must not be empty');
  }

  let headingIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const heading = HEADING_TITLE.exec(lines[i]);
    if (heading !== null && heading[1] === groupTitle) {
      headingIndex = i;
      break;
    }
  }
  if (headingIndex === -1) {
    throw DomainError.createNotFound(`Task group not found: ${groupTitle}`);
  }

  let groupEnd = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (HEADING.test(lines[i])) {
      groupEnd = i;
      break;
    }
  }

  const groupNumber = /^##\s+(\d+)/.exec(lines[headingIndex]);
  let lastTask = -1;
  let maxIndex = 0;
  for (let i = headingIndex + 1; i < groupEnd; i++) {
    if (!TASK.test(lines[i])) {
      continue;
    }
    lastTask = i;
    const parsed = parseTaskLine(lines[i]);
    if (parsed !== null && groupNumber !== null) {
      const sub = new RegExp(`^${groupNumber[1]}\\.(\\d+)`).exec(parsed.id);
      if (sub !== null) {
        maxIndex = Math.max(maxIndex, Number(sub[1]));
      }
    }
  }

  const id = groupNumber ? `${groupNumber[1]}.${maxIndex + 1}` : '';
  const line = id ? `- [ ] ${id} ${text}` : `- [ ] ${text}`;
  const insertAt = lastTask >= 0 ? endOfCommentBlock(lines, lastTask + 1) : headingIndex + 1;
  lines.splice(insertAt, 0, line);
}
