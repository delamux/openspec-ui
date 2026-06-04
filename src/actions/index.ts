import { defineAction } from 'astro:actions';
import { factory } from '../shared/infrastructure/factory';
import { listProjectsHandler } from './handlers';

export const server = {
  listProjects: defineAction({
    handler: () => listProjectsHandler(factory),
  }),
};
