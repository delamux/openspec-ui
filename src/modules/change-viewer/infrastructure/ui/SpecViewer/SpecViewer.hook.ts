import { useState } from 'react';
import { addTask, progress, removeTask, toggleTask, type TaskGroup, type Progress } from './specTasks';
import type { Spec, TabId } from './types';

export type ThemeMode = 'light' | 'dark';
export type InitialTheme = ThemeMode | 'system';

interface SpecViewerState {
  activeTab: TabId;
  theme: ThemeMode;
  groups: TaskGroup[];
  draft: string;
}

export interface SpecViewerView {
  activeTab: TabId;
  theme: ThemeMode;
  groups: TaskGroup[];
  draft: string;
  progress: Progress;
  selectTab: (tab: TabId) => void;
  toggleTheme: () => void;
  toggleTaskAt: (groupIndex: number, itemIndex: number) => void;
  removeTaskAt: (groupIndex: number, itemIndex: number) => void;
  changeDraft: (value: string) => void;
  addDraftTask: () => void;
}

function resolveTheme(initialTheme: InitialTheme): ThemeMode {
  if (initialTheme !== 'system') {
    return initialTheme;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function useSpecViewer(spec: Spec, initialTheme: InitialTheme = 'system'): SpecViewerView {
  const [state, setState] = useState<SpecViewerState>({
    activeTab: 'proposal',
    theme: resolveTheme(initialTheme),
    groups: spec.tasks,
    draft: '',
  });

  function selectTab(tab: TabId): void {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }

  function toggleTheme(): void {
    setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }

  function toggleTaskAt(groupIndex: number, itemIndex: number): void {
    setState((prev) => ({ ...prev, groups: toggleTask(prev.groups, groupIndex, itemIndex) }));
  }

  function removeTaskAt(groupIndex: number, itemIndex: number): void {
    setState((prev) => ({ ...prev, groups: removeTask(prev.groups, groupIndex, itemIndex) }));
  }

  function changeDraft(value: string): void {
    setState((prev) => ({ ...prev, draft: value }));
  }

  function addDraftTask(): void {
    setState((prev) => ({ ...prev, groups: addTask(prev.groups, prev.draft), draft: '' }));
  }

  return {
    activeTab: state.activeTab,
    theme: state.theme,
    groups: state.groups,
    draft: state.draft,
    progress: progress(state.groups),
    selectTab,
    toggleTheme,
    toggleTaskAt,
    removeTaskAt,
    changeDraft,
    addDraftTask,
  };
}
