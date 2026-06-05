import type { Task, TaskComment, TaskGroup, TaskList } from '../../domain/TaskList';

const HEADING = /^##\s+(.*\S)\s*$/;
const TASK = /^- \[([ xX])\]\s+(.*\S)\s*$/;
const COMMENT_OPEN = /^\s*<!--\s*ui:comment\b(.*?)-->\s*$/;
const COMMENT_CLOSE = /^\s*<!--\s*\/ui:comment\s*-->\s*$/;

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
      currentTask = { id: body.id, text: body.text, done: task[1].toLowerCase() === 'x', comments: [] };
      ensureGroup().items.push(currentTask);
      i++;
      continue;
    }

    const open = COMMENT_OPEN.exec(line);
    if (open && currentTask !== null) {
      const buffer: string[] = [];
      let scan = i + 1;
      let closed = false;
      while (scan < lines.length) {
        if (COMMENT_CLOSE.test(lines[scan])) {
          closed = true;
          break;
        }
        // a heading, task, or new comment-open ends an unterminated block — never consume them
        if (HEADING.test(lines[scan]) || TASK.test(lines[scan]) || COMMENT_OPEN.test(lines[scan])) {
          break;
        }
        buffer.push(lines[scan].trim());
        scan++;
      }
      if (closed) {
        currentTask.comments.push({
          author: attribute('author', open[1]),
          at: attribute('at', open[1]),
          text: buffer.join('\n').trim(),
        });
        i = scan + 1;
      } else {
        // malformed (no close) — drop the marker line, reprocess the rest normally
        i++;
      }
      continue;
    }

    i++;
  }

  return groups.filter((group) => group.title !== '' || group.items.length > 0);
}
