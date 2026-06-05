import { Avatar, Badge, Button, Checkbox, IconButton, Input } from '../../../../../shared/infrastructure/ui/components';
import { IconComment, IconTrash, IconPlus } from './icons';
import { initialsOf, relativeTime } from './commentFormat';
import { useTaskEditor, type TaskEditorView } from './TasksView.hook';
import type { TaskCommentDto, TaskDto, TaskGroupDto } from '../../../application/dtos';
import styles from './TasksView.module.css';

interface TasksViewProps {
  groups: TaskGroupDto[];
  progress: { done: number; total: number; pct: number };
  projectPath: string;
  changeName: string;
  onChanged: () => Promise<void>;
}

export function TasksView(props: TasksViewProps) {
  const editor = useTaskEditor(props.projectPath, props.changeName, props.onChanged);
  const now = Date.now();

  return (
    <div className={styles.tasks}>
      {editor.notice !== null ? <p className={styles.notice}>{editor.notice}</p> : null}

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
          <ul className={styles.taskList}>{group.items.map((task) => renderTask(task, editor, now))}</ul>
          {renderGroupAdd(group.title, editor)}
        </div>
      ))}
    </div>
  );
}

function renderGroupAdd(groupTitle: string, editor: TaskEditorView) {
  if (editor.addingGroup === groupTitle) {
    return (
      <div className={styles.addRow}>
        <Input
          value={editor.addDraft}
          placeholder="New task…"
          ariaLabel={`Add a task to ${groupTitle}`}
          onChange={(value) => editor.changeAddDraft(value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              editor.submitAdd(groupTitle, editor.addDraft);
            }
            if (event.key === 'Escape') {
              editor.cancelAdd();
            }
          }}
        />
        <Button onClick={() => editor.submitAdd(groupTitle, editor.addDraft)} disabled={editor.pending}>
          Add
        </Button>
        <Button variant="ghost" onClick={() => editor.cancelAdd()}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <button type="button" className={styles.addTrigger} onClick={() => editor.startAdd(groupTitle)}>
      <IconPlus size={14} /> Add task
    </button>
  );
}

function renderTask(task: TaskDto, editor: TaskEditorView, now: number) {
  const isEditing = editor.editingId === task.id && task.id !== '';
  const isConfirming = editor.confirmingDeleteId === task.id && task.id !== '';
  return (
    <li className={task.done ? `${styles.task} ${styles.taskDone}` : styles.task} key={task.id || task.text}>
      <div className={styles.taskRow}>
        <Checkbox checked={task.done} ariaLabel={task.text} onChange={() => editor.toggle(task)} />
        <span className={styles.taskId}>{task.id}</span>
        {isEditing ? (
          <span className={styles.taskEdit}>
            <Input
              value={editor.editDraft}
              ariaLabel="Edit task text"
              onChange={(value) => editor.changeEditDraft(value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  editor.saveEdit(task, editor.editDraft);
                }
                if (event.key === 'Escape') {
                  editor.cancelEdit();
                }
              }}
            />
          </span>
        ) : (
          <button
            type="button"
            className={styles.taskText}
            title={task.id !== '' ? 'Click to edit' : undefined}
            onClick={() => (task.id !== '' ? editor.startEdit(task) : undefined)}
          >
            {task.text}
          </button>
        )}
        <div className={styles.taskActions}>
          {task.comments.length > 0 ? (
            <Badge tone="muted">
              <IconComment size={13} /> {task.comments.length}
            </Badge>
          ) : null}
          {isConfirming ? (
            <span className={styles.confirm}>
              <Button variant="ghost" onClick={() => editor.confirmDelete(task)} disabled={editor.pending}>
                Delete
              </Button>
              <Button variant="ghost" onClick={() => editor.cancelDelete()}>
                Cancel
              </Button>
            </span>
          ) : (
            <span className={styles.deleteSlot}>
              <IconButton ariaLabel="Delete task" onClick={() => editor.requestDelete(task)}>
                <IconTrash size={14} />
              </IconButton>
            </span>
          )}
        </div>
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
