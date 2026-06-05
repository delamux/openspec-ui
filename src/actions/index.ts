import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { factory } from '../shared/infrastructure/factory';
import { listProjectsHandler, listChangesHandler, loadChangeHandler } from './handlers';

export const server = {
  listProjects: defineAction({
    handler: () => listProjectsHandler(factory),
  }),
  listChanges: defineAction({
    input: z.object({ projectPath: z.string() }),
    handler: (input) => listChangesHandler(factory, input),
  }),
  loadChange: defineAction({
    input: z.object({ projectPath: z.string(), changeName: z.string() }),
    handler: (input) => loadChangeHandler(factory, input),
  }),
};
