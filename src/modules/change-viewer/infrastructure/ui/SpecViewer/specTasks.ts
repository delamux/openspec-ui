export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskGroup {
  title: string;
  items: Task[];
}

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

export function toggleTask(groups: TaskGroup[], groupIndex: number, itemIndex: number): TaskGroup[] {
  return groups.map((group, gi) =>
    gi !== groupIndex
      ? group
      : {
          ...group,
          items: group.items.map((item, ii) => (ii !== itemIndex ? item : { ...item, done: !item.done })),
        },
  );
}

export function removeTask(groups: TaskGroup[], groupIndex: number, itemIndex: number): TaskGroup[] {
  return groups.map((group, gi) =>
    gi !== groupIndex ? group : { ...group, items: group.items.filter((_, ii) => ii !== itemIndex) },
  );
}

export function addTask(groups: TaskGroup[], text: string): TaskGroup[] {
  const trimmed = text.trim();
  if (trimmed.length === 0 || groups.length === 0) {
    return groups;
  }
  const lastIndex = groups.length - 1;
  return groups.map((group, gi) => {
    if (gi !== lastIndex) {
      return group;
    }
    const nextNumber = group.items.length + 1;
    const task: Task = { id: `${groups.length}.${nextNumber}`, text: trimmed, done: false };
    return { ...group, items: [...group.items, task] };
  });
}

export function progress(groups: TaskGroup[]): Progress {
  const all = groups.flatMap((group) => group.items);
  const done = all.filter((item) => item.done).length;
  const total = all.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}
