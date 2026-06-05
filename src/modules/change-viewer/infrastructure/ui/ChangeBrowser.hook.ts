import { useState } from 'react';
import { actions } from 'astro:actions';
import type { DiscoveryResultDto } from '../../../project-discovery/application/dtos';
import type { ChangeListResultDto, ChangeViewResultDto } from '../../application/dtos';

export type ThemeMode = 'light' | 'dark';

interface State {
  theme: ThemeMode;
  projects: DiscoveryResultDto | null;
  projectsLoading: boolean;
  projectPath: string;
  changes: ChangeListResultDto | null;
  changesLoading: boolean;
  changeName: string;
  view: ChangeViewResultDto | null;
  viewLoading: boolean;
}

export interface ChangeBrowserView {
  theme: ThemeMode;
  projects: DiscoveryResultDto | null;
  projectsLoading: boolean;
  projectPath: string;
  changes: ChangeListResultDto | null;
  changesLoading: boolean;
  changeName: string;
  view: ChangeViewResultDto | null;
  viewLoading: boolean;
  init: () => Promise<void>;
  selectProject: (path: string) => Promise<void>;
  selectChange: (projectPath: string, name: string) => Promise<void>;
  reload: () => Promise<void>;
  toggleTheme: () => void;
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

function syncUrl(projectPath: string, changeName: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const params = new URLSearchParams();
  if (projectPath) {
    params.set('project', projectPath);
  }
  if (changeName) {
    params.set('change', changeName);
  }
  const query = params.toString();
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

export function useChangeBrowser(): ChangeBrowserView {
  const [state, setState] = useState<State>({
    theme: 'light',
    projects: null,
    projectsLoading: false,
    projectPath: '',
    changes: null,
    changesLoading: false,
    changeName: '',
    view: null,
    viewLoading: false,
  });

  async function loadView(projectPath: string, changeName: string): Promise<void> {
    setState((prev) => ({ ...prev, changeName, viewLoading: true, view: null }));
    const response = await actions.loadChange({ projectPath, changeName });
    setState((prev) => ({
      ...prev,
      viewLoading: false,
      view: response.data ?? { kind: 'error', message: 'Failed to load the change' },
    }));
  }

  async function loadChanges(projectPath: string, preselect: string): Promise<void> {
    setState((prev) => ({ ...prev, changesLoading: true, changes: null, changeName: '', view: null }));
    const response = await actions.listChanges({ projectPath });
    const changes: ChangeListResultDto = response.data ?? { kind: 'error', message: 'Failed to load changes' };
    setState((prev) => ({ ...prev, changes, changesLoading: false }));
    if (preselect && changes.kind === 'ok' && changes.changes.some((change) => change.name === preselect)) {
      await loadView(projectPath, preselect);
    }
  }

  async function init(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const urlProject = params.get('project') ?? '';
    const urlChange = params.get('change') ?? '';
    // Apply the system theme now (post-mount), so it never affects the first render.
    setState((prev) => ({ ...prev, theme: systemTheme(), projectsLoading: true, projectPath: urlProject }));
    const response = await actions.listProjects();
    const projects: DiscoveryResultDto = response.data ?? { kind: 'discovery-error', message: 'Failed to load projects' };
    setState((prev) => ({ ...prev, projects, projectsLoading: false }));
    const known = projects.kind === 'ok' && projects.projects.some((project) => project.path === urlProject);
    if (urlProject && known) {
      await loadChanges(urlProject, urlChange);
    }
  }

  async function selectProject(path: string): Promise<void> {
    syncUrl(path, '');
    setState((prev) => ({ ...prev, projectPath: path }));
    await loadChanges(path, '');
  }

  async function selectChange(projectPath: string, name: string): Promise<void> {
    syncUrl(projectPath, name);
    await loadView(projectPath, name);
  }

  async function reload(): Promise<void> {
    if (state.projectPath && state.changeName) {
      await loadView(state.projectPath, state.changeName);
    }
  }

  function toggleTheme(): void {
    setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }

  return {
    theme: state.theme,
    projects: state.projects,
    projectsLoading: state.projectsLoading,
    projectPath: state.projectPath,
    changes: state.changes,
    changesLoading: state.changesLoading,
    changeName: state.changeName,
    view: state.view,
    viewLoading: state.viewLoading,
    init,
    selectProject,
    selectChange,
    reload,
    toggleTheme,
  };
}
