import { Avatar, Badge, Checkbox } from '../../../../../shared/infrastructure/ui/components';
import { IconComment } from './icons';
import { initialsOf, relativeTime } from './commentFormat';
import type { TaskCommentDto, TaskDto, TaskGroupDto } from '../../../application/dtos';
import styles from './TasksView.module.css';

interface TasksViewProps {
  groups: TaskGroupDto[];
  progress: { done: number; total: number; pct: number };
}

export function TasksView(props: TasksViewProps) {
  const now = Date.now();
  return (
    <div className={styles.tasks}>
      <div className={styles.progressCard}>
        <div className={styles.progressHead}>
          <span className={styles.progressLabel}>Implementation progress</span>
          <span className={styles.progressCount}>
            <strong>{props.progress.done}</strong> / {props.progress.total} · {props.progress.pct}%
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: props.progress.pct + '%' }} />
        </div>
      </div>

      {props.groups.map((group) => (
        <div key={group.title}>
          <div className={styles.groupTitle}>{group.title}</div>
          <ul className={styles.taskList}>
            {group.items.map((task) => renderTask(task, now))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function renderTask(task: TaskDto, now: number) {
  return (
    <li className={task.done ? `${styles.task} ${styles.taskDone}` : styles.task} key={task.id || task.text}>
      <div className={styles.taskRow}>
        <Checkbox checked={task.done} disabled ariaLabel={task.text} />
        <span className={styles.taskId}>{task.id}</span>
        <span className={styles.taskText}>{task.text}</span>
        {task.comments.length > 0 ? (
          <span className={styles.commentBadge}>
            <Badge tone="muted">
              <IconComment size={13} /> {task.comments.length}
            </Badge>
          </span>
        ) : null}
      </div>
      {task.comments.length > 0 ? (
        <div className={styles.thread}>{task.comments.map((comment, index) => renderComment(comment, index, now))}</div>
      ) : null}
    </li>
  );
}

function renderComment(comment: TaskCommentDto, index: number, now: number) {
  return (
    <div className={styles.comment} key={index}>
      <Avatar initials={initialsOf(comment.author)} />
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <span className={styles.commentAuthor}>{comment.author}</span>
          <span className={styles.commentWhen}>{relativeTime(comment.at, now)}</span>
        </div>
        <div className={styles.commentText}>{comment.text}</div>
      </div>
    </div>
  );
}
