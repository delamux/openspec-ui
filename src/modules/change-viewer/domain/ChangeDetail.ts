import type { Maybe } from '../../../shared/domain/Maybe';
import type { TaskList } from './TaskList';

// One delta spec of a change: openspec/changes/<change>/specs/<capability>/spec.md
export interface ChangeSpec {
  capability: string;
  content: string;
}

export interface ChangeDetail {
  proposal: Maybe<string>;
  design: Maybe<string>;
  specs: ChangeSpec[];
  tasks: Maybe<TaskList>;
}
