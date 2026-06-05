import type { ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
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
            className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
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
