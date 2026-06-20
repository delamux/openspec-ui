import { useEffect } from 'react';
import { Badge, Button, IconButton, Select, type SelectOption } from '../../../../shared/infrastructure/ui/components';
import { SpecViewer } from '../../../change-viewer/infrastructure/ui/SpecViewer/SpecViewer';
import { useWorktreePanel, type WorktreePanelView } from './WorktreePanel.hook';
import type { WorktreeDto } from '../../application/dtos';
import type { AgentStatusKind } from '../../domain/AgentStatus';
import styles from './WorktreePanel.module.css';

const STATUS_LABEL: Record<AgentStatusKind, string> = {
  working: 'Working',
  thinking: 'Thinking',
  waiting: 'Waiting',
  done: 'Done',
  idle: 'Idle',
  'no-session': 'No session',
};

interface Props {
  projectPath: string;
}

export function WorktreePanel(props: Props) {
  const panel = useWorktreePanel(props.projectPath);

  useEffect(() => {
    panel.init();
  }, [props.projectPath]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) {
        panel.pollActivity();
      }
    }, 3000);
    return () => clearInterval(id);
  }, [props.projectPath]);

  if (panel.selectedPath !== '') {
    return renderReview(panel);
  }

  return (
    <div className={styles.panel}>
      {renderCreateRow(panel)}
      {panel.notice ? <p className={styles.notice}>{panel.notice}</p> : null}
      {renderList(panel)}
    </div>
  );
}

function changeOptions(view: WorktreePanelView): SelectOption[] {
  if (view.changes === null || view.changes.kind !== 'ok') {
    return [];
  }
  return view.changes.changes
    .filter((change) => change.status === 'active')
    .map((change) => ({ value: change.name, label: change.name }));
}

function renderCreateRow(view: WorktreePanelView) {
  return (
    <div className={styles.createRow}>
      <Select
        ariaLabel="Change to branch for"
        placeholder="New worktree for change…"
        value={view.newChangeName}
        options={changeOptions(view)}
        onChange={(value) => view.setNewChange(value)}
      />
      <Button onClick={() => view.create()} disabled={view.newChangeName === ''}>
        Create worktree
      </Button>
    </div>
  );
}

function renderList(view: WorktreePanelView) {
  if (view.loading || view.worktrees === null) {
    return <p className={styles.message}>Loading worktrees…</p>;
  }
  if (view.worktrees.kind === 'error') {
    return <p className={styles.message}>{view.worktrees.message}</p>;
  }
  if (view.worktrees.worktrees.length === 0) {
    return <p className={styles.message}>No worktrees yet. Create one for a change above.</p>;
  }
  return <ul className={styles.list}>{view.worktrees.worktrees.map((worktree) => renderCard(view, worktree))}</ul>;
}

function renderCard(view: WorktreePanelView, worktree: WorktreeDto) {
  const activity = view.activityByPath[worktree.path];
  const status: AgentStatusKind = activity ? activity.status : 'no-session';
  const changeName = worktree.changeName;
  return (
    <li key={worktree.path} className={styles.card}>
      <div className={styles.cardHead}>
        <span className={`${styles.dot} ${styles[status]}`} aria-hidden="true" />
        <span className={styles.branch}>{worktree.branch ?? 'detached HEAD'}</span>
        {worktree.isMain ? <Badge tone="muted">main</Badge> : null}
        <span className={styles.statusLabel}>{STATUS_LABEL[status]}</span>
        {activity && activity.tokenCount !== null ? (
          <span className={styles.tokens}>{activity.tokenCount.toLocaleString()} tok</span>
        ) : null}
      </div>

      {worktree.progress ? (
        <div className={styles.progressRow}>
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${worktree.progress.pct}%` }} />
          </div>
          <span className={styles.progressText}>
            {worktree.progress.done}/{worktree.progress.total} tasks
          </span>
        </div>
      ) : null}

      {activity && activity.lastFile ? (
        <span className={styles.lastFile}>
          {activity.lastTool ? `${activity.lastTool} · ` : ''}
          {activity.lastFile}
        </span>
      ) : null}

      <div className={styles.cardActions}>
        {changeName ? (
          <Button variant="ghost" onClick={() => view.review(worktree.path, changeName)}>
            Review
          </Button>
        ) : null}
        {worktree.isMain ? null : (
          <IconButton ariaLabel="Remove worktree" onClick={() => view.remove(worktree.path)}>
            ✕
          </IconButton>
        )}
      </div>
    </li>
  );
}

function renderReview(view: WorktreePanelView) {
  return (
    <div className={styles.review}>
      <div className={styles.reviewHead}>
        <Button variant="ghost" onClick={() => view.closeReview()}>
          ← Back to worktrees
        </Button>
        <span className={styles.reviewNote}>
          Editing the worktree copy — toggles and comments reach the agent working here.
        </span>
      </div>
      {renderReviewBody(view)}
    </div>
  );
}

function renderReviewBody(view: WorktreePanelView) {
  if (view.reviewLoading || view.reviewView === null) {
    return <p className={styles.message}>Loading change…</p>;
  }
  if (view.reviewView.kind === 'error') {
    return <p className={styles.message}>{view.reviewView.message}</p>;
  }
  return (
    <SpecViewer
      view={view.reviewView.view}
      projectPath={view.selectedPath}
      changeName={view.selectedChangeName}
      onChanged={view.reloadReview}
    />
  );
}
