import type { Factory } from '../shared/infrastructure/factory';
import {
  toDiscoveryResultDto,
  type DiscoveryResultDto,
} from '../modules/project-discovery/application/dtos';

export async function listProjectsHandler(factory: Factory): Promise<DiscoveryResultDto> {
  return toDiscoveryResultDto(await factory.discoverProjects().execute());
}
