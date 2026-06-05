import type { ReactNode } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps {
  children: ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}

export function IconButton(props: IconButtonProps) {
  return (
    <button type="button" aria-label={props.ariaLabel} className={styles.iconBtn} onClick={() => props.onClick?.()}>
      {props.children}
    </button>
  );
}
