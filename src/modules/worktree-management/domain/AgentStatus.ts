export type AgentStatusKind = 'working' | 'thinking' | 'waiting' | 'done' | 'idle' | 'no-session';

const ACTIVE: AgentStatusKind[] = ['working', 'thinking', 'waiting'];

export class AgentStatus {
  private constructor(readonly kind: AgentStatusKind) {}

  static fromKind(kind: AgentStatusKind): AgentStatus {
    return new AgentStatus(kind);
  }

  static noSession(): AgentStatus {
    return new AgentStatus('no-session');
  }

  isActive(): boolean {
    return ACTIVE.includes(this.kind);
  }

  isNoSession(): boolean {
    return this.kind === 'no-session';
  }
}
