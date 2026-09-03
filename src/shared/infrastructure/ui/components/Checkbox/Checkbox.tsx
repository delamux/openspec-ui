import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onChange?: () => void;
}

export function Checkbox(props: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={props.checked}
      aria-label={props.ariaLabel}
      disabled={props.disabled ?? false}
      className={styles.check}
      onClick={() => props.onChange?.()}
    >
      <span className={props.checked ? `${styles.box} ${styles.checked}` : styles.box}>
        {props.checked ? (
          <svg
            className={styles.mark}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
      </span>
      {props.label !== undefined ? <span className={styles.label}>{props.label}</span> : null}
    </button>
  );
}
