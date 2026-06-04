import type { Progress, TaskGroup } from './specTasks';
import { IconCheck, IconPlus, IconTrash } from './icons';
import styles from './TasksView.module.css';

interface TasksViewProps {
  groups: TaskGroup[];
  draft: string;
  progress: Progress;
  onToggle: (groupIndex: number, itemIndex: number) => void;
  onRemove: (groupIndex: number, itemIndex: number) => void;
  onChangeDraft: (value: string) => void;
  onAdd: () => void;
}

export function TasksView(props: TasksViewProps) {
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

      {props.groups.map((group, groupIndex) => (
        <div key={group.title}>
          <div className={styles.taskGroupTitle}>{group.title}</div>
          <ul className={styles.taskList}>
            {group.items.map((task, itemIndex) => (
              <li className={task.done ? `${styles.task} ${styles.taskDone}` : styles.task} key={task.id}>
                <button
                  className={styles.check}
                  role="checkbox"
                  aria-checked={task.done}
                  onClick={() => props.onToggle(groupIndex, itemIndex)}
                >
                  {task.done ? <IconCheck size={12} /> : null}
                </button>
                <span className={styles.taskId}>{task.id}</span>
                <span className={styles.taskText}>{task.text}</span>
                <button
                  className={styles.taskDel}
                  aria-label="Delete task"
                  onClick={() => props.onRemove(groupIndex, itemIndex)}
                >
                  <IconTrash size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className={styles.taskAdd}>
        <input
          value={props.draft}
          placeholder="Add a task…"
          onChange={(event) => props.onChangeDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              props.onAdd();
            }
          }}
        />
        <button className={styles.btnAdd} onClick={() => props.onAdd()}>
          <IconPlus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
