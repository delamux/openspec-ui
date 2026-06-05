import { useState } from 'react';
import { actions } from 'astro:actions';
import type { TaskDto, TaskEditResultDto } from '../../../application/dtos';

interface EditorState {
  editingId: string | null;
  editDraft: string;
  addingGroup: string | null;
  addDraft: string;
  confirmingDeleteId: string | null;
  pending: boolean;
  notice: string | null;
}

export interface TaskEditorView {
  editingId: string | null;
  editDraft: string;
  addingGroup: string | null;
  addDraft: string;
  confirmingDeleteId: string | null;
  pending: boolean;
  notice: string | null;
  toggle: (task: TaskDto) => Promise<void>;
  startEdit: (task: TaskDto) => void;
  changeEditDraft: (value: string) => void;
  saveEdit: (task: TaskDto, newText: string) => Promise<void>;
  cancelEdit: () => void;
  requestDelete: (task: TaskDto) => void;
  cancelDelete: () => void;
  confirmDelete: (task: TaskDto) => Promise<void>;
  startAdd: (groupTitle: string) => void;
  cancelAdd: () => void;
  changeAddDraft: (value: string) => void;
  submitAdd: (groupTitle: string, text: string) => Promise<void>;
}

const initialState: EditorState = {
  editingId: null,
  editDraft: '',
  addingGroup: null,
  addDraft: '',
  confirmingDeleteId: null,
  pending: false,
  notice: null,
};

export function useTaskEditor(projectPath: string, changeName: string, onChanged: () => Promise<void>): TaskEditorView {
  const [state, setState] = useState<EditorState>(initialState);

  async function settle(result: { data?: TaskEditResultDto; error?: unknown }, onOk: () => void): Promise<void> {
    const outcome: TaskEditResultDto = result.data ?? { kind: 'error', message: 'Request failed' };
    if (outcome.kind === 'ok') {
      onOk();
      setState((prev) => ({ ...prev, pending: false, notice: null }));
      await onChanged();
      return;
    }
    if (outcome.kind === 'stale') {
      setState((prev) => ({ ...prev, pending: false, editingId: null, confirmingDeleteId: null, notice: 'This change was edited elsewhere — reloaded with the latest.' }));
      await onChanged();
      return;
    }
    setState((prev) => ({ ...prev, pending: false, notice: outcome.message }));
  }

  async function toggle(task: TaskDto): Promise<void> {
    setState((prev) => ({ ...prev, pending: true }));
    const result = await actions.toggleTask({ projectPath, changeName, id: task.id, expectedText: task.text });
    await settle(result, () => undefined);
  }

  function startEdit(task: TaskDto): void {
    setState((prev) => ({ ...prev, editingId: task.id, editDraft: task.text, notice: null }));
  }

  function changeEditDraft(value: string): void {
    setState((prev) => ({ ...prev, editDraft: value }));
  }

  function cancelEdit(): void {
    setState((prev) => ({ ...prev, editingId: null }));
  }

  async function saveEdit(task: TaskDto, draft: string): Promise<void> {
    const newText = draft.trim();
    if (newText.length === 0) {
      setState((prev) => ({ ...prev, notice: 'Task text must not be empty' }));
      return;
    }
    setState((prev) => ({ ...prev, pending: true }));
    const result = await actions.editTaskText({ projectPath, changeName, id: task.id, expectedText: task.text, newText });
    await settle(result, () => setState((prev) => ({ ...prev, editingId: null })));
  }

  function requestDelete(task: TaskDto): void {
    setState((prev) => ({ ...prev, confirmingDeleteId: task.id, notice: null }));
  }

  function cancelDelete(): void {
    setState((prev) => ({ ...prev, confirmingDeleteId: null }));
  }

  async function confirmDelete(task: TaskDto): Promise<void> {
    setState((prev) => ({ ...prev, pending: true }));
    const result = await actions.deleteTask({ projectPath, changeName, id: task.id, expectedText: task.text });
    await settle(result, () => setState((prev) => ({ ...prev, confirmingDeleteId: null })));
  }

  function startAdd(groupTitle: string): void {
    setState((prev) => ({ ...prev, addingGroup: groupTitle, addDraft: '', notice: null }));
  }

  function cancelAdd(): void {
    setState((prev) => ({ ...prev, addingGroup: null, addDraft: '' }));
  }

  function changeAddDraft(value: string): void {
    setState((prev) => ({ ...prev, addDraft: value }));
  }

  async function submitAdd(groupTitle: string, rawText: string): Promise<void> {
    const text = rawText.trim();
    if (text.length === 0) {
      return;
    }
    setState((prev) => ({ ...prev, pending: true }));
    const result = await actions.addTask({ projectPath, changeName, groupTitle, text });
    await settle(result, () => setState((prev) => ({ ...prev, addingGroup: null, addDraft: '' })));
  }

  return {
    editingId: state.editingId,
    editDraft: state.editDraft,
    addingGroup: state.addingGroup,
    addDraft: state.addDraft,
    confirmingDeleteId: state.confirmingDeleteId,
    pending: state.pending,
    notice: state.notice,
    toggle,
    startEdit,
    changeEditDraft,
    saveEdit,
    cancelEdit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    startAdd,
    cancelAdd,
    changeAddDraft,
    submitAdd,
  };
}
