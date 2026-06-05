import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Badge, Button, Checkbox, IconButton, Input } from '../../../../../shared/infrastructure/ui/components';
import { IconComment, IconTrash, IconPlus, IconGrip } from './icons';
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
          <SortableSection group={group} editor={editor} now={now} />
          {renderGroupAdd(group.title, editor)}
        </div>
      ))}
    </div>
  );
}

function SortableSection(props: { group: TaskGroupDto; editor: TaskEditorView; now: number }) {
  // Local order so a drop reorders instantly (optimistic); re-synced from props after
  // the server write reloads. Without this, dnd-kit animates the item back to its old
  // slot before the async reload arrives, which reads as a "snap back".
  const [items, setItems] = useState<TaskDto[]>(props.group.items);
  const signature = props.group.items.map((task) => `${task.id}:${task.text}:${task.done}:${task.comments.length}`).join('|');
  useEffect(() => {
    setItems(props.group.items);
  }, [signature]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((task) => task.id);

  function onDragEnd(event: { active: { id: string | number }; over: { id: string | number } | null }) {
    if (event.over === null || event.active.id === event.over.id) {
      return;
    }
    const oldIndex = ids.indexOf(String(event.active.id));
    const newIndex = ids.indexOf(String(event.over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    props.editor.reorder(props.group.title, reordered.map((task) => task.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={styles.taskList}>
          {items.map((task) => (
            <SortableTask key={task.id || task.text} task={task} editor={props.editor} now={props.now} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableTask(props: { task: TaskDto; editor: TaskEditorView; now: number }) {
  const sortable = useSortable({ id: props.task.id });
  const task = props.task;
  const editor = props.editor;
  const isEditing = editor.editingId === task.id && task.id !== '';
  const isConfirming = editor.confirmingDeleteId === task.id && task.id !== '';
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={sortable.setNodeRef}
      style={style}
      className={task.done ? `${styles.task} ${styles.taskDone}` : styles.task}
    >
      <div className={styles.taskRow}>
        <button className={styles.dragHandle} aria-label="Drag to reorder" {...sortable.attributes} {...sortable.listeners}>
          <IconGrip size={14} />
        </button>
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
        <div className={styles.thread}>{task.comments.map((comment, index) => renderComment(comment, index, props.now))}</div>
      ) : null}
    </li>
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
