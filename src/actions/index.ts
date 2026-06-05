import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { factory } from '../shared/infrastructure/factory';
import {
  listProjectsHandler,
  listChangesHandler,
  loadChangeHandler,
  toggleTaskHandler,
  editTaskTextHandler,
  deleteTaskHandler,
  addTaskHandler,
  reorderTasksHandler,
} from './handlers';

const taskTarget = { projectPath: z.string(), changeName: z.string(), id: z.string(), expectedText: z.string() };

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
  toggleTask: defineAction({
    input: z.object(taskTarget),
    handler: (input) => toggleTaskHandler(factory, input),
  }),
  editTaskText: defineAction({
    input: z.object({ ...taskTarget, newText: z.string() }),
    handler: (input) => editTaskTextHandler(factory, input),
  }),
  deleteTask: defineAction({
    input: z.object(taskTarget),
    handler: (input) => deleteTaskHandler(factory, input),
  }),
  addTask: defineAction({
    input: z.object({ projectPath: z.string(), changeName: z.string(), groupTitle: z.string(), text: z.string() }),
    handler: (input) => addTaskHandler(factory, input),
  }),
  reorderTasks: defineAction({
    input: z.object({
      projectPath: z.string(),
      changeName: z.string(),
      groupTitle: z.string(),
      orderedIds: z.array(z.string()),
    }),
    handler: (input) => reorderTasksHandler(factory, input),
  }),
};
