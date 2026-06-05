import type { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  type?: 'button' | 'submit';
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary';
  return (
    <button
      type={props.type ?? 'button'}
      disabled={props.disabled ?? false}
      className={variant === 'ghost' ? `${styles.btn} ${styles.ghost}` : styles.btn}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </button>
  );
}
