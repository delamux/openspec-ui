import styles from './Avatar.module.css';

interface AvatarProps {
  initials: string;
  tone?: 'muted' | 'primary';
}

export function Avatar(props: AvatarProps) {
  const tone = props.tone ?? 'muted';
  return (
    <div className={tone === 'primary' ? `${styles.avatar} ${styles.you}` : styles.avatar} aria-hidden="true">
      {props.initials}
    </div>
  );
}
