import type { TaskGroup } from './specTasks';

export interface SpecMeta {
  change: string;
  title: string;
  status: string;
  author: string;
  updated: string;
}

export interface Spec {
  meta: SpecMeta;
  proposal: string;
  design: string;
  tasks: TaskGroup[];
}

export type TabId = 'proposal' | 'design' | 'tasks';
