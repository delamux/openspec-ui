import { useEffect } from 'react';
import { useSpecViewer, type InitialTheme } from './SpecViewer.hook';
import { renderMarkdown } from './markdown';
import { TabNav } from './TabNav';
import { TasksView } from './TasksView';
import { IconMoon, IconSun } from './icons';
import type { Spec } from './types';
import styles from './SpecViewer.module.css';

interface SpecViewerProps {
  spec: Spec;
  initialTheme?: InitialTheme;
}

function Markdown(props: { source: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(props.source) }} />;
}

export function SpecViewer(props: SpecViewerProps) {
  const view = useSpecViewer(props.spec, props.initialTheme ?? 'system');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', view.theme === 'dark');
  }, [view.theme]);

  return (
    <div className={styles.app}>
      <header className={styles.appbar}>
        <div className={styles.brand}>
          <div className={styles.logo}>◆</div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>{props.spec.meta.change}</div>
            <div className={styles.brandSub}>{props.spec.meta.title}</div>
          </div>
        </div>
        <div className={styles.appbarRight}>
          <span className={styles.statusBadge}>{props.spec.meta.status}</span>
          <button className={styles.iconBtn} aria-label="Toggle theme" onClick={() => view.toggleTheme()}>
            {view.theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        </div>
      </header>

      <div className={styles.tabbarWrap}>
        <TabNav active={view.activeTab} onSelect={view.selectTab} />
      </div>

      <main className={styles.mainScroll}>
        <div className={styles.content} role="tabpanel">
          {view.activeTab === 'proposal' ? <Markdown source={props.spec.proposal} /> : null}
          {view.activeTab === 'design' ? <Markdown source={props.spec.design} /> : null}
          {view.activeTab === 'tasks' ? (
            <TasksView
              groups={view.groups}
              draft={view.draft}
              progress={view.progress}
              onToggle={view.toggleTaskAt}
              onRemove={view.removeTaskAt}
              onChangeDraft={view.changeDraft}
              onAdd={view.addDraftTask}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
