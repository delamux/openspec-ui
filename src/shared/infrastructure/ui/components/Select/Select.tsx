import type { ChangeEvent } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

// A non-selectable heading with its own options below it (a native <optgroup>).
export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export type SelectItem = SelectOption | SelectGroup;

interface SelectProps {
  value: string;
  options: SelectItem[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function Select(props: SelectProps) {
  return (
    <div className={styles.wrap}>
      <select
        className={styles.select}
        value={props.value}
        aria-label={props.ariaLabel}
        disabled={props.disabled ?? false}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => props.onChange(event.target.value)}
      >
        {props.placeholder !== undefined ? (
          <option value="" disabled>
            {props.placeholder}
          </option>
        ) : null}
        {props.options.map((item) =>
          isGroup(item) ? (
            <optgroup key={item.label} label={item.label}>
              {item.options.map(renderOption)}
            </optgroup>
          ) : (
            renderOption(item)
          ),
        )}
      </select>
      <svg
        className={styles.chevron}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function renderOption(option: SelectOption) {
  return (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  );
}

function isGroup(item: SelectItem): item is SelectGroup {
  return 'options' in item;
}
