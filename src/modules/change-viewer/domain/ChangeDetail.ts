import type { Maybe } from '../../../shared/domain/Maybe';
import type { TaskList } from './TaskList';

export interface ChangeDetail {
  proposal: Maybe<string>;
  design: Maybe<string>;
  tasks: Maybe<TaskList>;
}
