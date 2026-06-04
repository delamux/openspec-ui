import type { Project } from '../domain/Project';
import type { DiscoveryResult } from '../domain/DiscoveryResult';

export interface ProjectDto {
  name: string;
  path: string;
}

export type DiscoveryResultDto =
  | { kind: 'not-configured' }
  | { kind: 'ok'; projects: ProjectDto[] }
  | { kind: 'discovery-error'; message: string };

export function toProjectDto(project: Project): ProjectDto {
  return { name: project.name, path: project.path };
}

export function toDiscoveryResultDto(result: DiscoveryResult): DiscoveryResultDto {
  if (result.kind === 'ok') {
    return { kind: 'ok', projects: result.projects.map(toProjectDto) };
  }
  return result;
}
