export interface AgentTaskScaffolderInput {
  projectPath: string;
  worktreePath: string;
  changeName: string;
}

export interface AgentTaskScaffolder {
  scaffold(input: AgentTaskScaffolderInput): Promise<void>;
}

export class InMemoryAgentTaskScaffolder implements AgentTaskScaffolder {
  readonly calls: AgentTaskScaffolderInput[] = [];

  async scaffold(input: AgentTaskScaffolderInput): Promise<void> {
    this.calls.push(input);
  }
}
