import { Project } from './Project';

export type DiscoveryResult =
  | { kind: 'not-configured' }
  | { kind: 'ok'; projects: Project[] }
  | { kind: 'discovery-error'; message: string };

export const DiscoveryResult = {
  notConfigured(): DiscoveryResult {
    return { kind: 'not-configured' };
  },
  ok(projects: Project[]): DiscoveryResult {
    return { kind: 'ok', projects };
  },
  error(message: string): DiscoveryResult {
    return { kind: 'discovery-error', message };
  },
};
