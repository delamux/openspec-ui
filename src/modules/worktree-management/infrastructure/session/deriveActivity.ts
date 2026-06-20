import { Maybe } from '../../../../shared/domain/Maybe';
import { AgentStatus, type AgentStatusKind } from '../../domain/AgentStatus';
import { noSessionActivity, type AgentActivity } from '../../domain/AgentActivity';

type SessionEvent = Record<string, any>;

interface Accumulated {
  lastTool: string | null;
  lastFile: string | null;
  lastLine: number | null;
  lastMessage: string | null;
  tokenCount: number;
  lastTs: number | null;
  lastHasToolCall: boolean;
}

const IDLE_MS = 5 * 60 * 1000;
const ACTIVE_MS = 30 * 1000;

export function deriveActivity(lines: string[], now: number): AgentActivity {
  const events = lines.map(parseLine).filter((event): event is SessionEvent => event !== null);
  const accumulated = accumulate(events);
  if (accumulated.lastTs === null) {
    return noSessionActivity();
  }
  return {
    status: AgentStatus.fromKind(inferStatus(accumulated, now)),
    lastTool: Maybe.fromNullable(accumulated.lastTool),
    lastFile: Maybe.fromNullable(accumulated.lastFile),
    lastLine: Maybe.fromNullable(accumulated.lastLine),
    lastMessage: Maybe.fromNullable(accumulated.lastMessage),
    tokenCount: accumulated.tokenCount > 0 ? Maybe.some(accumulated.tokenCount) : Maybe.none<number>(),
    lastActivityAt: Maybe.some(new Date(accumulated.lastTs)),
  };
}

function parseLine(line: string): SessionEvent | null {
  try {
    return JSON.parse(line) as SessionEvent;
  } catch {
    return null;
  }
}

function accumulate(events: SessionEvent[]): Accumulated {
  const state: Accumulated = {
    lastTool: null,
    lastFile: null,
    lastLine: null,
    lastMessage: null,
    tokenCount: 0,
    lastTs: null,
    lastHasToolCall: false,
  };
  for (const event of events) {
    const ts = event.timestamp ? new Date(event.timestamp).getTime() : NaN;
    if (!Number.isNaN(ts)) {
      state.lastTs = ts;
    }
    if (event.type === 'assistant') {
      readAssistant(event, state);
    }
  }
  return state;
}

function readAssistant(event: SessionEvent, state: Accumulated): void {
  state.lastHasToolCall = false;
  const content = Array.isArray(event.message?.content) ? event.message.content : [];
  for (const item of content) {
    if (item.type === 'text' && typeof item.text === 'string') {
      state.lastMessage = item.text.trim();
    }
    if (item.type === 'tool_use') {
      readToolUse(item, state);
    }
  }
  const tokens = event.message?.usage?.output_tokens;
  if (typeof tokens === 'number') {
    state.tokenCount = tokens;
  }
}

function readToolUse(item: SessionEvent, state: Accumulated): void {
  state.lastHasToolCall = true;
  state.lastTool = item.name ?? null;
  const input = item.input ?? {};
  const filePath = input.file_path ?? input.path ?? null;
  if (filePath) {
    state.lastFile = filePath;
  }
  if (input.line != null) {
    state.lastLine = input.line;
  }
}

function inferStatus(state: Accumulated, now: number): AgentStatusKind {
  const idleMs = state.lastTs === null ? Infinity : now - state.lastTs;
  if (idleMs > IDLE_MS) {
    return 'idle';
  }
  if (idleMs < ACTIVE_MS) {
    return state.lastHasToolCall ? 'working' : 'thinking';
  }
  const message = state.lastMessage ?? '';
  return message.includes('?') || message.endsWith(':') ? 'waiting' : 'done';
}
