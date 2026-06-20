import { useEffect } from 'react';
import {
  Badge,
  IconButton,
  Select,
  Tabs,
  type SelectOption,
  type TabItem,
} from '../../../../shared/infrastructure/ui/components';
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

function changeOptions(changes: SelectableChangesResultDto | null): SelectOption[] {
  if (changes === null || changes.kind !== 'ok') {
    return [];
  }
  return changes.changes.map((change) => ({ value: change.key, label: change.label }));
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
          <div className={styles.picker}>
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
            <div className={styles.picker}>
              <Select
                ariaLabel="Change"
                placeholder="Select a change…"
                value={view.changeKey}
                options={changeOptions(view.changes)}
                disabled={view.changes === null || view.changes.kind !== 'ok' || view.changes.changes.length === 0}
                onChange={(value) => view.selectChange(value)}
              />
            </div>
          ) : null}
          {view.projectPath !== '' ? (
            <Tabs items={WORKSPACE_TABS} active={view.tab} onSelect={(id) => view.setTab(id as 'changes' | 'worktrees')} />
          ) : null}
        </div>

        <div className={styles.appbarRight}>
          {selectedChange ? (
            <Badge tone={selectedChange.status === 'archived' ? 'muted' : 'primary'}>
              {selectedChange.status === 'archived' ? 'Archived' : 'Active'}
            </Badge>
          ) : null}
          <IconButton ariaLabel="Toggle theme" onClick={() => view.toggleTheme()}>
            {view.theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </IconButton>
        </div>
      </header>

      <main className={styles.body}>{renderBody(view)}</main>
    </div>
  );
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
