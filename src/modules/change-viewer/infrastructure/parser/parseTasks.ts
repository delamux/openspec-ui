import type { Task, TaskComment, TaskGroup, TaskList } from '../../domain/TaskList';
import { commentCloseIndex, endOfTaskBlock, isCommentOpen } from './taskBlock';

const HEADING = /^##\s+(.*\S)\s*$/;
const TASK = /^- \[([ xX])\]\s+(.*\S)\s*$/;
const COMMENT_OPEN = /^\s*<!--\s*ui:comment\b(.*?)-->\s*$/;

function parseTaskBody(body: string): { id: string; text: string } {
  const withId = /^(\d+(?:\.\d+)*)\s+(.*)$/.exec(body);
  return withId ? { id: withId[1], text: withId[2] } : { id: '', text: body };
}

function attribute(name: string, raw: string): string {
  const quoted = new RegExp(`${name}\\s*=\\s*"([^"]*)"`).exec(raw);
  if (quoted) {
    return quoted[1];
  }
  const bare = new RegExp(`${name}\\s*=\\s*(\\S+)`).exec(raw);
  return bare ? bare[1] : '';
}

function dedent(lines: string[]): string {
  const indents = lines.filter((line) => line.trim() !== '').map((line) => /^[ \t]*/.exec(line)![0].length);
  const common = indents.length === 0 ? 0 : Math.min(...indents);
  return lines
    .map((line) => line.slice(common).trimEnd())
    .join('\n')
    .replace(/^\n+|\n+$/g, '');
}

function commentFrom(lines: string[], open: number, close: number): TaskComment {
  const attributes = COMMENT_OPEN.exec(lines[open])![1];
  return {
    author: attribute('author', attributes),
    at: attribute('at', attributes),
    text: lines
      .slice(open + 1, close)
      .map((line) => line.trim())
      .join('\n')
      .trim(),
  };
}

// Splits the lines under a task into its ui:comment blocks and the markdown left around them.
function readTaskBlock(lines: string[], from: number, to: number): { comments: TaskComment[]; details: string } {
  const comments: TaskComment[] = [];
  const detailLines: string[] = [];
  let i = from;
  while (i < to) {
    const close = isCommentOpen(lines[i]) ? commentCloseIndex(lines, i) : -1;
    if (close !== -1) {
      comments.push(commentFrom(lines, i, close));
      i = close + 1;
      continue;
    }
    detailLines.push(lines[i]);
    i += 1;
  }
  return { comments, details: dedent(detailLines) };
}

export function parseTasks(markdown: string): TaskList {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const groups: TaskGroup[] = [];
  let currentGroup: TaskGroup | null = null;
  let currentTask: Task | null = null;
  let i = 0;

  const ensureGroup = (): TaskGroup => {
    if (currentGroup === null) {
      currentGroup = { title: '', items: [] };
      groups.push(currentGroup);
    }
    return currentGroup;
  };

  while (i < lines.length) {
    const line = lines[i];

    const heading = HEADING.exec(line);
    if (heading) {
      currentGroup = { title: heading[1], items: [] };
      currentTask = null;
      groups.push(currentGroup);
      i++;
      continue;
    }

    const task = TASK.exec(line);
    if (task) {
      const body = parseTaskBody(task[2]);
      const blockEnd = endOfTaskBlock(lines, i);
      const block = readTaskBlock(lines, i + 1, blockEnd);
      currentTask = {
        id: body.id,
        text: body.text,
        done: task[1].toLowerCase() === 'x',
        comments: block.comments,
        details: block.details,
      };
      ensureGroup().items.push(currentTask);
      i = blockEnd;
      continue;
    }

    // A comment block separated from its task by top-level text still belongs to that task.
    const close = isCommentOpen(line) ? commentCloseIndex(lines, i) : -1;
    if (close !== -1 && currentTask !== null) {
      currentTask.comments.push(commentFrom(lines, i, close));
      i = close + 1;
      continue;
    }

    i++;
  }

  return groups.filter((group) => group.title !== '' || group.items.length > 0);
}
