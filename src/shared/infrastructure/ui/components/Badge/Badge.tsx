import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  tone?: 'primary' | 'muted';
}

export function Badge(props: BadgeProps) {
  const tone = props.tone ?? 'primary';
  return <span className={tone === 'muted' ? `${styles.badge} ${styles.muted}` : styles.badge}>{props.children}</span>;
}
