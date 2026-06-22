import { describe, it, expect } from 'vitest';
import { deriveActivity } from './deriveActivity';

const NOW = 1_000_000_000_000;

function at(offsetMs: number): string {
  return new Date(NOW - offsetMs).toISOString();
}

function assistantToolUse(offsetMs: number): string {
  return JSON.stringify({
    type: 'assistant',
    timestamp: at(offsetMs),
    message: { content: [{ type: 'tool_use', name: 'Edit', input: { file_path: '/p/AuthService.ts', line: 42 } }], usage: { output_tokens: 1234 } },
  });
}

function assistantText(offsetMs: number, text: string): string {
  return JSON.stringify({ type: 'assistant', timestamp: at(offsetMs), message: { content: [{ type: 'text', text }] } });
}

describe('deriveActivity', () => {
  it('reports working with last tool/file when the latest entry used a tool just now', () => {
    const activity = deriveActivity([assistantToolUse(10_000)], NOW);

    expect(activity.status.kind).toBe('working');
    expect(activity.lastTool.getOrThrow()).toBe('Edit');
    expect(activity.lastFile.getOrThrow()).toBe('/p/AuthService.ts');
    expect(activity.lastLine.getOrThrow()).toBe(42);
    expect(activity.tokenCount.getOrThrow()).toBe(1234);
  });

  it('reports thinking when the latest entry is text-only and recent', () => {
    expect(deriveActivity([assistantText(10_000, 'Let me check')], NOW).status.kind).toBe('thinking');
  });

  it('reports done when the last activity is a minute old and not a question', () => {
    expect(deriveActivity([assistantText(60_000, 'All set.')], NOW).status.kind).toBe('done');
  });

  it('reports waiting when the recent message asks a question', () => {
    expect(deriveActivity([assistantText(60_000, 'Which option do you want?')], NOW).status.kind).toBe('waiting');
  });

  it('reports idle when the last activity is older than five minutes', () => {
    expect(deriveActivity([assistantText(6 * 60_000, 'done')], NOW).status.kind).toBe('idle');
  });

  it('reports no-session for empty input', () => {
    expect(deriveActivity([], NOW).status.isNoSession()).toBe(true);
  });

  it('skips malformed lines and still derives a status from the valid ones', () => {
    const activity = deriveActivity(['not json {', assistantToolUse(10_000)], NOW);

    expect(activity.status.kind).toBe('working');
  });
});
