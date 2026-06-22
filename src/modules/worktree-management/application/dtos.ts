import type { Progress } from '../../change-viewer/domain/TaskList';
import type { SelectableChangeDto } from '../../change-viewer/application/dtos';
import type { AgentActivity } from '../domain/AgentActivity';
import type { AgentStatusKind } from '../domain/AgentStatus';
import type { WorktreeOverview } from './ListWorktrees';
import type { WorktreeActivityItem } from './GetWorktreesActivity';
import type { SelectableChange } from './ListSelectableChanges';

export interface WorktreeDto {
  path: string;
  branch: string | null;
  isMain: boolean;
  changeName: string | null;
  progress: Progress | null;
}

export interface AgentActivityDto {
  status: AgentStatusKind;
  lastTool: string | null;
  lastFile: string | null;
  lastLine: number | null;
  lastMessage: string | null;
  tokenCount: number | null;
  lastActivity: string | null;
}

export interface WorktreeActivityItemDto {
  path: string;
  activity: AgentActivityDto;
}

export type WorktreeListResultDto =
  | { kind: 'ok'; worktrees: WorktreeDto[] }
  | { kind: 'error'; message: string };

export type WorktreeActivityResultDto =
  | { kind: 'ok'; items: WorktreeActivityItemDto[] }
  | { kind: 'error'; message: string };

export type WorktreeCreateResultDto =
  | { kind: 'ok'; worktree: WorktreeDto }
  | { kind: 'stale' }
  | { kind: 'error'; message: string };

export type WorktreeRemoveResultDto = { kind: 'ok' } | { kind: 'error'; message: string };

export type WorktreeOpenResultDto = { kind: 'ok' } | { kind: 'error'; message: string };

function orNull<T>(value: { fold: <R>(onNone: () => R, onSome: (v: T) => R) => R }): T | null {
  return value.fold<T | null>(
    () => null,
    (some) => some,
  );
}

export function toWorktreeDto(overview: WorktreeOverview): WorktreeDto {
  return {
    path: overview.worktree.path,
    branch: orNull(overview.worktree.branch),
    isMain: overview.worktree.isMain,
    changeName: orNull(overview.worktree.changeName()),
    progress: orNull(overview.progress),
  };
}

export function toAgentActivityDto(activity: AgentActivity): AgentActivityDto {
  return {
    status: activity.status.kind,
    lastTool: orNull(activity.lastTool),
    lastFile: orNull(activity.lastFile),
    lastLine: orNull(activity.lastLine),
    lastMessage: orNull(activity.lastMessage),
    tokenCount: orNull(activity.tokenCount),
    lastActivity: orNull(activity.lastActivityAt.map((date) => date.toISOString())),
  };
}

export function toWorktreeActivityItemDto(item: WorktreeActivityItem): WorktreeActivityItemDto {
  return { path: item.path, activity: toAgentActivityDto(item.activity) };
}

export function toSelectableChangeDto(change: SelectableChange): SelectableChangeDto {
  return change.worktreeName.fold<SelectableChangeDto>(
    () => ({
      key: change.name,
      name: change.name,
      status: change.status,
      label: change.status === 'archived' ? `${stripDate(change.name)} · archived` : change.name,
      sourcePath: change.sourcePath,
      isWorktree: false,
    }),
    (worktree) => ({
      key: `${worktree}::${change.name}`,
      name: change.name,
      status: change.status,
      label: `${change.name} · worktree ${worktree}`,
      sourcePath: change.sourcePath,
      isWorktree: true,
    }),
  );
}

function stripDate(name: string): string {
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}
