import { Maybe } from '../../../../shared/domain/Maybe';
import { DomainError } from '../../../../shared/domain/DomainError';
import type { Change } from '../Change';
import type { ChangeDetail } from '../ChangeDetail';
import type { TaskEdit } from '../TaskEdit';
import type { Task, TaskGroup, TaskList } from '../TaskList';

export interface ChangeRepository {
  listChanges(projectPath: string): Promise<Change[]>;
  loadChange(projectPath: string, changeName: string): Promise<ChangeDetail>;
  editTasks(projectPath: string, changeName: string, edit: TaskEdit): Promise<void>;
}

const emptyDetail: ChangeDetail = {
  proposal: Maybe.none<string>(),
  design: Maybe.none<string>(),
  tasks: Maybe.none(),
};

export class InMemoryChangeRepository implements ChangeRepository {
  constructor(
    private readonly changesByProject: Map<string, Change[]> = new Map(),
    private readonly detailsByChange: Map<string, ChangeDetail> = new Map(),
  ) {}

  async listChanges(projectPath: string): Promise<Change[]> {
    return this.changesByProject.get(projectPath) ?? [];
  }

  async loadChange(projectPath: string, changeName: string): Promise<ChangeDetail> {
    return this.detailsByChange.get(`${projectPath}::${changeName}`) ?? emptyDetail;
  }

  async editTasks(projectPath: string, changeName: string, edit: TaskEdit): Promise<void> {
    const key = `${projectPath}::${changeName}`;
    const detail = this.detailsByChange.get(key);
    const list = detail
      ? detail.tasks.fold<TaskList | null>(
          () => null,
          (value) => value,
        )
      : null;
    if (!detail || list === null) {
      throw DomainError.createNotFound(`No task list for change: ${changeName}`);
    }
    this.detailsByChange.set(key, { ...detail, tasks: Maybe.some(applyStructuralEdit(list, edit)) });
  }
}

function applyStructuralEdit(list: TaskList, edit: TaskEdit): TaskList {
  const groups: TaskGroup[] = list.map((group) => ({ ...group, items: [...group.items] }));

  if (edit.kind === 'add') {
    const text = edit.text.trim();
    if (text.length === 0) {
      throw DomainError.createValidation('Task text must not be empty');
    }
    const lastGroup = groups[groups.length - 1];
    const groupNumber = /^(\d+)/.exec(lastGroup.title);
    const id = groupNumber ? `${groupNumber[1]}.${lastGroup.items.length + 1}` : '';
    lastGroup.items.push({ id, text, done: false, comments: [] });
    return groups;
  }

  const target = findTask(groups, edit.id, edit.expectedText);

  if (edit.kind === 'toggle') {
    target.group.items[target.index] = { ...target.task, done: !target.task.done };
    return groups;
  }
  if (edit.kind === 'edit-text') {
    const newText = edit.newText.trim();
    if (newText.length === 0) {
      throw DomainError.createValidation('Task text must not be empty');
    }
    target.group.items[target.index] = { ...target.task, text: newText };
    return groups;
  }
  target.group.items.splice(target.index, 1);
  return groups;
}

function findTask(
  groups: TaskGroup[],
  id: string,
  expectedText: string,
): { group: TaskGroup; index: number; task: Task } {
  let sawId = false;
  for (const group of groups) {
    for (let index = 0; index < group.items.length; index++) {
      const task = group.items[index];
      if (task.id !== '' && task.id === id) {
        if (task.text === expectedText) {
          return { group, index, task };
        }
        sawId = true;
      }
    }
  }
  if (sawId) {
    throw DomainError.createConflict(`Task ${id} changed since it was loaded; reload the change`);
  }
  throw DomainError.createNotFound(`Task not found: ${id}`);
}
