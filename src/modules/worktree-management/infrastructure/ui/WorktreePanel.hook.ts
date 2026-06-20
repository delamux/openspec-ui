import { useState } from 'react';
import { actions } from 'astro:actions';
import type {
  WorktreeListResultDto,
  WorktreeActivityResultDto,
  AgentActivityDto,
} from '../../application/dtos';
import type { ChangeListResultDto, ChangeViewResultDto } from '../../../change-viewer/application/dtos';

interface State {
  worktrees: WorktreeListResultDto | null;
  loading: boolean;
  activityByPath: Record<string, AgentActivityDto>;
  changes: ChangeListResultDto | null;
  newChangeName: string;
  notice: string;
  selectedPath: string;
  selectedChangeName: string;
  reviewView: ChangeViewResultDto | null;
  reviewLoading: boolean;
}

export interface WorktreePanelView {
  worktrees: WorktreeListResultDto | null;
  loading: boolean;
  activityByPath: Record<string, AgentActivityDto>;
  changes: ChangeListResultDto | null;
  newChangeName: string;
  notice: string;
  selectedPath: string;
  selectedChangeName: string;
  reviewView: ChangeViewResultDto | null;
  reviewLoading: boolean;
  init: () => Promise<void>;
  pollActivity: () => Promise<void>;
  setNewChange: (name: string) => void;
  create: () => Promise<void>;
  remove: (worktreePath: string) => Promise<void>;
  review: (worktreePath: string, changeName: string) => Promise<void>;
  reloadReview: () => Promise<void>;
  closeReview: () => void;
}

const initialState: State = {
  worktrees: null,
  loading: false,
  activityByPath: {},
  changes: null,
  newChangeName: '',
  notice: '',
  selectedPath: '',
  selectedChangeName: '',
  reviewView: null,
  reviewLoading: false,
};

export function useWorktreePanel(projectPath: string): WorktreePanelView {
  const [state, setState] = useState<State>(initialState);

  const loadWorktrees = async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true }));
    const result = await actions.listWorktrees({ projectPath });
    setState((prev) => ({ ...prev, worktrees: result.data ?? null, loading: false }));
  };

  const loadChanges = async (): Promise<void> => {
    const result = await actions.listChanges({ projectPath });
    setState((prev) => ({ ...prev, changes: result.data ?? null }));
  };

  const pollActivity = async (): Promise<void> => {
    const result = await actions.worktreeActivity({ projectPath });
    setState((prev) => ({ ...prev, activityByPath: indexActivity(result.data) }));
  };

  const init = async (): Promise<void> => {
    setState(() => ({ ...initialState }));
    await Promise.all([loadWorktrees(), loadChanges()]);
    await pollActivity();
  };

  const setNewChange = (name: string): void => {
    setState((prev) => ({ ...prev, newChangeName: name }));
  };

  const create = async (): Promise<void> => {
    if (state.newChangeName === '') {
      return;
    }
    const result = await actions.createWorktreeForChange({ projectPath, changeName: state.newChangeName });
    setState((prev) => ({ ...prev, notice: noticeFor(result.data), newChangeName: '' }));
    await loadWorktrees();
    await pollActivity();
  };

  const remove = async (worktreePath: string): Promise<void> => {
    const result = await actions.removeWorktree({ projectPath, worktreePath });
    setState((prev) => ({ ...prev, notice: result.data?.kind === 'error' ? result.data.message : '' }));
    await loadWorktrees();
  };

  const review = async (worktreePath: string, changeName: string): Promise<void> => {
    setState((prev) => ({ ...prev, selectedPath: worktreePath, selectedChangeName: changeName, reviewLoading: true }));
    const result = await actions.loadChange({ projectPath: worktreePath, changeName });
    setState((prev) => ({ ...prev, reviewView: result.data ?? null, reviewLoading: false }));
  };

  const reloadReview = async (): Promise<void> => {
    if (state.selectedPath === '') {
      return;
    }
    const result = await actions.loadChange({ projectPath: state.selectedPath, changeName: state.selectedChangeName });
    setState((prev) => ({ ...prev, reviewView: result.data ?? null }));
    await loadWorktrees();
  };

  const closeReview = (): void => {
    setState((prev) => ({ ...prev, selectedPath: '', selectedChangeName: '', reviewView: null }));
  };

  return {
    worktrees: state.worktrees,
    loading: state.loading,
    activityByPath: state.activityByPath,
    changes: state.changes,
    newChangeName: state.newChangeName,
    notice: state.notice,
    selectedPath: state.selectedPath,
    selectedChangeName: state.selectedChangeName,
    reviewView: state.reviewView,
    reviewLoading: state.reviewLoading,
    init,
    pollActivity,
    setNewChange,
    create,
    remove,
    review,
    reloadReview,
    closeReview,
  };
}

function indexActivity(result: WorktreeActivityResultDto | undefined): Record<string, AgentActivityDto> {
  if (result === undefined || result.kind !== 'ok') {
    return {};
  }
  return Object.fromEntries(result.items.map((item) => [item.path, item.activity]));
}

function noticeFor(result: { kind: string; message?: string } | undefined): string {
  if (result === undefined) {
    return 'Could not create the worktree';
  }
  if (result.kind === 'stale') {
    return 'A worktree already exists for this change';
  }
  if (result.kind === 'error') {
    return result.message ?? 'Could not create the worktree';
  }
  return '';
}
