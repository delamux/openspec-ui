import type { KeyboardEvent } from 'react';
import styles from './Input.module.css';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function Input(props: InputProps) {
  return (
    <input
      className={styles.input}
      value={props.value}
      placeholder={props.placeholder}
      aria-label={props.ariaLabel}
      onChange={(event) => props.onChange(event.target.value)}
      onKeyDown={props.onKeyDown}
    />
  );
}
