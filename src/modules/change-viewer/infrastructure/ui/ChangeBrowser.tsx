import { useEffect } from 'react';
import {
  Badge,
  Checkbox,
  IconButton,
  Select,
  Tabs,
  type SelectOption,
  type TabItem,
} from '../../../../shared/infrastructure/ui/components';
import { changePickerItems } from './changePickerItems';
import { useChangeBrowser } from './ChangeBrowser.hook';
import { SpecViewer } from './SpecViewer/SpecViewer';
import { IconSun, IconMoon } from './SpecViewer/icons';
import { WorktreePanel } from '../../../worktree-management/infrastructure/ui/WorktreePanel';
import type { DiscoveryResultDto } from '../../../project-discovery/application/dtos';
import type { SelectableChangesResultDto, ChangeViewResultDto } from '../../application/dtos';
import styles from './ChangeBrowser.module.css';

const WORKSPACE_TABS: TabItem[] = [
  { id: 'changes', label: 'Changes' },
  { id: 'worktrees', label: 'Worktrees' },
];

function projectOptions(projects: DiscoveryResultDto | null): SelectOption[] {
  if (projects === null || projects.kind !== 'ok') {
    return [];
  }
  return projects.projects.map((project) => ({ value: project.path, label: project.name }));
}

function projectName(projects: DiscoveryResultDto | null, projectPath: string): string {
  if (projects === null || projects.kind !== 'ok') {
    return 'Changes';
  }
  const project = projects.projects.find((candidate) => candidate.path === projectPath);
  return project?.name ?? 'Changes';
}

function hasArchived(changes: SelectableChangesResultDto | null): boolean {
  if (changes === null || changes.kind !== 'ok') {
    return false;
  }
  return changes.changes.some((change) => change.status === 'archived');
}

export function ChangeBrowser() {
  const view = useChangeBrowser();

  useEffect(() => {
    view.init();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', view.theme === 'dark');
  }, [view.theme]);

  const selectedChange =
    view.changes !== null && view.changes.kind === 'ok'
      ? view.changes.changes.find((change) => change.key === view.changeKey)
      : undefined;

  return (
    <div className={styles.app}>
      <header className={styles.appbar}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg viewBox="0 0 32 32" width="17" height="17" aria-hidden="true">
              <path d="M16 6 26 16 16 26 6 16Z" fill="currentColor" />
              <path d="M16 12 20 16 16 20 12 16Z" fill="var(--primary)" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>OpenSpec</div>
            <div className={styles.brandSub}>Browse changes</div>
          </div>
        </div>

        <div className={styles.pickers}>
          <div className={`${styles.picker} ${styles.projectPicker}`}>
            <Select
              ariaLabel="Project"
              placeholder="Select a project…"
              value={view.projectPath}
              options={projectOptions(view.projects)}
              disabled={view.projects === null || view.projects.kind !== 'ok'}
              onChange={(value) => view.selectProject(value)}
            />
          </div>
          {view.tab === 'changes' ? (
            <div className={`${styles.picker} ${styles.changePicker}`}>
              <Select
                ariaLabel="Change"
                placeholder="Select a change…"
                value={view.changeKey}
                options={changeItems(view)}
                disabled={view.changes === null || view.changes.kind !== 'ok' || view.changes.changes.length === 0}
                onChange={(value) => view.selectChange(value)}
              />
            </div>
          ) : null}
          {view.tab === 'changes' && hasArchived(view.changes) ? (
            <div className={styles.archivedToggle}>
              <Checkbox
                checked={view.showArchived}
                label="Show archived"
                ariaLabel="Show archived changes"
                onChange={() => view.toggleArchived()}
              />
            </div>
          ) : null}
          {view.projectPath !== '' ? (
            <div className={styles.workspaceTabs}>
              <Tabs items={WORKSPACE_TABS} active={view.tab} onSelect={(id) => view.setTab(id as 'changes' | 'worktrees')} />
            </div>
          ) : null}
        </div>

        <div className={styles.appbarRight}>
          {view.tab === 'changes' && selectedChange ? (
            <div className={styles.statusBadge}>
              <Badge tone={selectedChange.status === 'archived' ? 'muted' : 'primary'}>
                {selectedChange.status === 'archived' ? 'Archived' : 'Active'}
              </Badge>
            </div>
          ) : null}
          <div className={styles.themeToggle}>
            <IconButton ariaLabel="Toggle theme" onClick={() => view.toggleTheme()}>
              {view.theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </IconButton>
          </div>
        </div>
      </header>

      <main className={styles.body}>{renderBody(view)}</main>
    </div>
  );
}

function changeItems(view: ReturnType<typeof useChangeBrowser>) {
  if (view.changes === null || view.changes.kind !== 'ok') {
    return [];
  }
  return changePickerItems({
    changes: view.changes.changes,
    projectName: projectName(view.projects, view.projectPath),
    showArchived: view.showArchived,
    selectedKey: view.changeKey,
  });
}

function message(text: string) {
  return <p className={styles.message}>{text}</p>;
}

function renderBody(view: ReturnType<typeof useChangeBrowser>) {
  if (view.projectsLoading || view.projects === null) {
    return message('Loading projects…');
  }
  if (view.projects.kind === 'not-configured') {
    return message('Set PROJECTS_PATH in your .env file to discover projects.');
  }
  if (view.projects.kind === 'discovery-error') {
    return message(view.projects.message);
  }
  if (view.projectPath === '') {
    return message('Select a project to begin.');
  }
  if (view.tab === 'worktrees') {
    return <WorktreePanel projectPath={view.projectPath} />;
  }
  if (view.changesLoading || view.changes === null) {
    return message('Loading changes…');
  }
  if (view.changes.kind === 'error') {
    return message(view.changes.message);
  }
  if (view.changes.changes.length === 0) {
    return message('This project has no OpenSpec changes.');
  }
  if (view.changeName === '') {
    return message('Select a change to view it.');
  }
  if (view.viewLoading || view.view === null) {
    return message('Loading change…');
  }
  if (view.view.kind === 'error') {
    return message(view.view.message);
  }
  return (
    <SpecViewer
      view={(view.view as Extract<ChangeViewResultDto, { kind: 'ok' }>).view}
      projectPath={view.projectPath}
      changeName={view.changeName}
      onChanged={view.reload}
    />
  );
}
