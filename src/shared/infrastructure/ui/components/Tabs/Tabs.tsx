import type { ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  // Draws attention to a tab the user should not miss, even when it is not active.
  highlighted?: boolean;
}

function tabClass(item: TabItem, isActive: boolean): string {
  return [styles.tab, isActive ? styles.tabActive : '', item.highlighted ? styles.tabHighlighted : '']
    .filter((name) => name !== '')
    .join(' ');
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onSelect: (id: string) => void;
}

export function Tabs(props: TabsProps) {
  return (
    <nav className={styles.tabnav} role="tablist">
      {props.items.map((item) => {
        const isActive = props.active === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            className={tabClass(item, isActive)}
            onClick={() => props.onSelect(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
