import type { ReactNode } from 'react';
import type { TabId } from './types';
import { IconProposal, IconDesign, IconTasks } from './icons';
import styles from './SpecViewer.module.css';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: (props: { size?: number }) => ReactNode;
}

const TABS: TabDefinition[] = [
  { id: 'proposal', label: 'Proposal', icon: IconProposal },
  { id: 'design', label: 'Design', icon: IconDesign },
  { id: 'tasks', label: 'Tasks', icon: IconTasks },
];

interface TabNavProps {
  active: TabId;
  onSelect: (tab: TabId) => void;
}

export function TabNav(props: TabNavProps) {
  return (
    <nav className={styles.tabnav} role="tablist">
      {TABS.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = props.active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => props.onSelect(tab.id)}
          >
            <TabIcon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
