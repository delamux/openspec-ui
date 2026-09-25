import { useState } from 'react';
import { actions } from 'astro:actions';
import type { DiscoveryResultDto } from '../../../project-discovery/application/dtos';
import type { SelectableChangesResultDto, ChangeViewResultDto } from '../../application/dtos';
import { matchSelectableChange, searchFromSelection, selectionFromSearch, type BrowserSelection } from './selectionUrl';

export type ThemeMode = 'light' | 'dark';
export type WorkspaceTab = 'changes' | 'worktrees' | 'project';

interface State {
  theme: ThemeMode;
  tab: WorkspaceTab;
  showArchived: boolean;
  projects: DiscoveryResultDto | null;
  projectsLoading: boolean;
  projectPath: string;
  changes: SelectableChangesResultDto | null;
  changesLoading: boolean;
  changeKey: string;
  changeName: string;
  changeSource: string;
  view: ChangeViewResultDto | null;
  viewLoading: boolean;
}

export interface ChangeBrowserView {
  theme: ThemeMode;
  tab: WorkspaceTab;
  showArchived: boolean;
  projects: DiscoveryResultDto | null;
  projectsLoading: boolean;
  projectPath: string;
  changes: SelectableChangesResultDto | null;
  changesLoading: boolean;
  changeKey: string;
  changeName: string;
  view: ChangeViewResultDto | null;
  viewLoading: boolean;
  init: () => Promise<void>;
  selectProject: (path: string) => Promise<void>;
  selectChange: (key: string) => Promise<void>;
  reload: () => Promise<void>;
  toggleTheme: () => void;
  toggleArchived: () => void;
  setTab: (tab: WorkspaceTab) => void;
}

// The first render must be identical on server and client to avoid a hydration
// mismatch, so theme starts at a fixed value and the system preference is read
// only after mount (in init), never in the useState initializer.
function systemTheme(): ThemeMode {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function syncUrl(selection: BrowserSelection): void {
  if (typeof window === 'undefined') {
    return;
  }
  const query = searchFromSelection(selection);
  window.history.replaceState(null, '', query === '' ? window.location.pathname : query);
}

export function useChangeBrowser(): ChangeBrowserView {
  const [state, setState] = useState<State>({
    theme: 'light',
    tab: 'changes',
    showArchived: false,
    projects: null,
    projectsLoading: false,
    projectPath: '',
    changes: null,
    changesLoading: false,
    changeKey: '',
    changeName: '',
    changeSource: '',
    view: null,
    viewLoading: false,
  });

  async function loadView(key: string, sourcePath: string, changeName: string): Promise<void> {
    setState((prev) => ({ ...prev, changeKey: key, changeName, changeSource: sourcePath, viewLoading: true, view: null }));
    const response = await actions.loadChange({ projectPath: sourcePath, changeName });
    setState((prev) => ({
      ...prev,
      viewLoading: false,
      view: response.data ?? { kind: 'error', message: 'Failed to load the change' },
    }));
  }

  async function loadChanges(projectPath: string, changeName: string, worktreeName: string): Promise<void> {
    setState((prev) => ({
      ...prev,
      changesLoading: true,
      changes: null,
      changeKey: '',
      changeName: '',
      changeSource: '',
      view: null,
    }));
    const response = await actions.listSelectableChanges({ projectPath });
    const changes: SelectableChangesResultDto = response.data ?? { kind: 'error', message: 'Failed to load changes' };
    setState((prev) => ({ ...prev, changes, changesLoading: false }));
    if (changes.kind === 'ok') {
      const match = matchSelectableChange(changes.changes, changeName, worktreeName);
      if (match !== undefined) {
        await loadView(match.key, match.sourcePath, match.name);
      }
    }
  }

  async function init(): Promise<void> {
    const selection = selectionFromSearch(window.location.search);
    // Apply the system theme now (post-mount), so it never affects the first render.
    setState((prev) => ({ ...prev, theme: systemTheme(), projectsLoading: true, projectPath: selection.projectPath }));
    const response = await actions.listProjects();
    const projects: DiscoveryResultDto = response.data ?? { kind: 'discovery-error', message: 'Failed to load projects' };
    setState((prev) => ({ ...prev, projects, projectsLoading: false }));
    const known = projects.kind === 'ok' && projects.projects.some((project) => project.path === selection.projectPath);
    if (selection.projectPath && known) {
      await loadChanges(selection.projectPath, selection.changeName, selection.worktreeName);
    }
  }

  async function selectProject(path: string): Promise<void> {
    syncUrl({ projectPath: path, changeName: '', worktreeName: '' });
    setState((prev) => ({ ...prev, projectPath: path }));
    await loadChanges(path, '', '');
  }

  async function selectChange(key: string): Promise<void> {
    const list = state.changes;
    if (list === null || list.kind !== 'ok') {
      return;
    }
    const selected = list.changes.find((change) => change.key === key);
    if (selected === undefined) {
      return;
    }
    syncUrl({
      projectPath: state.projectPath,
      changeName: selected.name,
      worktreeName: selected.worktreeName ?? '',
    });
    await loadView(selected.key, selected.sourcePath, selected.name);
  }

  // Soft reload after an edit: refresh the view in place WITHOUT blanking it, so the
  // SpecViewer stays mounted and the active tab (and editor state) are preserved.
  async function reload(): Promise<void> {
    if (!state.changeSource || !state.changeName) {
      return;
    }
    const response = await actions.loadChange({ projectPath: state.changeSource, changeName: state.changeName });
    setState((prev) => ({
      ...prev,
      view: response.data ?? { kind: 'error', message: 'Failed to reload the change' },
    }));
  }

  function toggleTheme(): void {
    setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }

  function toggleArchived(): void {
    setState((prev) => ({ ...prev, showArchived: !prev.showArchived }));
  }

  function setTab(tab: WorkspaceTab): void {
    setState((prev) => ({ ...prev, tab }));
  }

  return {
    theme: state.theme,
    tab: state.tab,
    showArchived: state.showArchived,
    projects: state.projects,
    projectsLoading: state.projectsLoading,
    projectPath: state.projectPath,
    changes: state.changes,
    changesLoading: state.changesLoading,
    changeKey: state.changeKey,
    changeName: state.changeName,
    view: state.view,
    viewLoading: state.viewLoading,
    init,
    selectProject,
    selectChange,
    reload,
    toggleTheme,
    toggleArchived,
    setTab,
  };
}
