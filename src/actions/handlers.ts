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

function messageFrom(error: unknown): string {
  if (error instanceof DomainError) {
    // not-found / validation messages are safe (no filesystem paths); technical errors are generalized
    return error.isNotFound() || error.isValidation() ? error.message : 'Could not read the change from disk';
  }
  return 'Something went wrong';
}
