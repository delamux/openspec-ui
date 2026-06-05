import type { Factory } from '../shared/infrastructure/factory';
import {
  toDiscoveryResultDto,
  type DiscoveryResultDto,
} from '../modules/project-discovery/application/dtos';
import {
  toChangeSummaryDto,
  toChangeViewDto,
  type ChangeListResultDto,
  type ChangeViewResultDto,
  type TaskEditResultDto,
} from '../modules/change-viewer/application/dtos';
import { DomainError } from '../shared/domain/DomainError';

export async function listProjectsHandler(factory: Factory): Promise<DiscoveryResultDto> {
  return toDiscoveryResultDto(await factory.discoverProjects().execute());
}

export async function listChangesHandler(
  factory: Factory,
  input: { projectPath: string },
): Promise<ChangeListResultDto> {
  try {
    const changes = await factory.listChanges().execute(input.projectPath);
    return { kind: 'ok', changes: changes.map(toChangeSummaryDto) };
  } catch (error) {
    return { kind: 'error', message: messageFrom(error) };
  }
}

export async function loadChangeHandler(
  factory: Factory,
  input: { projectPath: string; changeName: string },
): Promise<ChangeViewResultDto> {
  try {
    const detail = await factory.loadChange().execute(input.projectPath, input.changeName);
    return { kind: 'ok', view: toChangeViewDto(detail) };
  } catch (error) {
    return { kind: 'error', message: messageFrom(error) };
  }
}

async function runEdit(operation: () => Promise<void>): Promise<TaskEditResultDto> {
  try {
    await operation();
    return { kind: 'ok' };
  } catch (error) {
    if (error instanceof DomainError && error.isConflict()) {
      return { kind: 'stale' };
    }
    return { kind: 'error', message: messageFrom(error) };
  }
}

export function toggleTaskHandler(
  factory: Factory,
  input: { projectPath: string; changeName: string; id: string; expectedText: string },
): Promise<TaskEditResultDto> {
  return runEdit(() => factory.toggleTask().execute(input.projectPath, input.changeName, input.id, input.expectedText));
}

export function editTaskTextHandler(
  factory: Factory,
  input: { projectPath: string; changeName: string; id: string; expectedText: string; newText: string },
): Promise<TaskEditResultDto> {
  return runEdit(() =>
    factory.editTaskText().execute(input.projectPath, input.changeName, input.id, input.expectedText, input.newText),
  );
}

export function deleteTaskHandler(
  factory: Factory,
  input: { projectPath: string; changeName: string; id: string; expectedText: string },
): Promise<TaskEditResultDto> {
  return runEdit(() => factory.deleteTask().execute(input.projectPath, input.changeName, input.id, input.expectedText));
}

export function addTaskHandler(
  factory: Factory,
  input: { projectPath: string; changeName: string; groupTitle: string; text: string },
): Promise<TaskEditResultDto> {
  return runEdit(() => factory.addTask().execute(input.projectPath, input.changeName, input.groupTitle, input.text));
}

export function reorderTasksHandler(
  factory: Factory,
  input: { projectPath: string; changeName: string; groupTitle: string; orderedIds: string[] },
): Promise<TaskEditResultDto> {
  return runEdit(() =>
    factory.reorderTasks().execute(input.projectPath, input.changeName, input.groupTitle, input.orderedIds),
  );
}

function messageFrom(error: unknown): string {
  if (error instanceof DomainError) {
    // not-found / validation messages are safe (no filesystem paths); technical errors are generalized
    return error.isNotFound() || error.isValidation() ? error.message : 'Could not read the change from disk';
  }
  return 'Something went wrong';
}
