import type { Change, ChangeStatus } from '../domain/Change';
import type { ChangeDetail } from '../domain/ChangeDetail';
import { progress, type TaskList } from '../domain/TaskList';

export interface ChangeSummaryDto {
  name: string;
  status: ChangeStatus;
}

export interface TaskCommentDto {
  author: string;
  at: string;
  text: string;
}

export interface TaskDto {
  id: string;
  text: string;
  done: boolean;
  comments: TaskCommentDto[];
}

export interface TaskGroupDto {
  title: string;
  items: TaskDto[];
}

export interface ChangeViewDto {
  proposal: string | null;
  design: string | null;
  tasks: TaskGroupDto[] | null;
  progress: { done: number; total: number; pct: number };
}

export type ChangeListResultDto =
  | { kind: 'ok'; changes: ChangeSummaryDto[] }
  | { kind: 'error'; message: string };

export type ChangeViewResultDto =
  | { kind: 'ok'; view: ChangeViewDto }
  | { kind: 'error'; message: string };

export type TaskEditResultDto =
  | { kind: 'ok' }
  | { kind: 'stale' }
  | { kind: 'error'; message: string };

export function toChangeSummaryDto(change: Change): ChangeSummaryDto {
  return { name: change.name, status: change.status };
}

export function toChangeViewDto(detail: ChangeDetail): ChangeViewDto {
  const tasks = detail.tasks.fold<TaskList | null>(
    () => null,
    (list) => list,
  );
  return {
    proposal: detail.proposal.fold<string | null>(
      () => null,
      (value) => value,
    ),
    design: detail.design.fold<string | null>(
      () => null,
      (value) => value,
    ),
    tasks,
    progress: progress(tasks ?? []),
  };
}
