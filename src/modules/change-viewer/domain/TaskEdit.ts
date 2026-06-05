export type TaskEdit =
  | { kind: 'toggle'; id: string; expectedText: string }
  | { kind: 'edit-text'; id: string; expectedText: string; newText: string }
  | { kind: 'delete'; id: string; expectedText: string }
  | { kind: 'add'; text: string };
