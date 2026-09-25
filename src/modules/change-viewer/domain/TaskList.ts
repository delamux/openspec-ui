export interface TaskComment {
  author: string;
  at: string;
  text: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  comments: TaskComment[];
  // Markdown written under the task line (wrapped text, code blocks), dedented; '' when none.
  details: string;
}

export interface TaskGroup {
  title: string;
  items: Task[];
}

export type TaskList = TaskGroup[];

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

export function progress(list: TaskList): Progress {
  const all = list.flatMap((group) => group.items);
  const done = all.filter((task) => task.done).length;
  const total = all.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}
