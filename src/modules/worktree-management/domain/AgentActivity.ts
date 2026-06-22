import { Maybe } from '../../../shared/domain/Maybe';
import { AgentStatus } from './AgentStatus';

export interface AgentActivity {
  status: AgentStatus;
  lastTool: Maybe<string>;
  lastFile: Maybe<string>;
  lastLine: Maybe<number>;
  lastMessage: Maybe<string>;
  tokenCount: Maybe<number>;
  lastActivityAt: Maybe<Date>;
}

export function noSessionActivity(): AgentActivity {
  return {
    status: AgentStatus.noSession(),
    lastTool: Maybe.none<string>(),
    lastFile: Maybe.none<string>(),
    lastLine: Maybe.none<number>(),
    lastMessage: Maybe.none<string>(),
    tokenCount: Maybe.none<number>(),
    lastActivityAt: Maybe.none<Date>(),
  };
}
