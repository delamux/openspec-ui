import { describe, it, expect } from 'vitest';
import { changePickerItems } from './changePickerItems';
import type { SelectableChangeDto } from '../../application/dtos';

function change(overrides: Partial<SelectableChangeDto>): SelectableChangeDto {
  return {
    key: overrides.name ?? 'add-auth',
    name: 'add-auth',
    status: 'active',
    label: 'add-auth',
    sourcePath: '/p',
    worktreeName: null,
    progress: null,
    ...overrides,
  };
}

describe('changePickerItems', () => {
  it('groups the main changes under the project name', () => {
    const items = changePickerItems({
      changes: [change({ key: 'add-auth', name: 'add-auth', label: 'add-auth · 1/3 tasks' })],
      projectName: 'openspec-ui',
      showArchived: false,
      selectedKey: '',
    });

    expect(items).toEqual([
      { label: 'openspec-ui', options: [{ value: 'add-auth', label: 'add-auth · 1/3 tasks' }] },
    ]);
  });

  it('gives every worktree its own group, after the main changes', () => {
    const items = changePickerItems({
      changes: [
        change({ key: 'add-auth', name: 'add-auth' }),
        change({ key: 'wt-a::add-auth', name: 'add-auth', worktreeName: 'wt-a' }),
        change({ key: 'wt-b::new-idea', name: 'new-idea', label: 'new-idea', worktreeName: 'wt-b' }),
        change({ key: 'wt-a::other', name: 'other', label: 'other', worktreeName: 'wt-a' }),
      ],
      projectName: 'openspec-ui',
      showArchived: false,
      selectedKey: '',
    });

    expect(items.map((item) => item.label)).toEqual(['openspec-ui', 'WT wt-a', 'WT wt-b']);
    expect(items[1].options.map((option) => option.value)).toEqual(['wt-a::add-auth', 'wt-a::other']);
  });

  it('lists the worktree own change first, then the others alphabetically', () => {
    const items = changePickerItems({
      changes: [
        change({ key: 'wt-a::zebra', name: 'zebra', label: 'zebra', worktreeName: 'wt-a' }),
        change({ key: 'wt-a::add-auth', name: 'add-auth', label: 'add-auth', worktreeName: 'wt-a' }),
        change({ key: 'wt-a::middle', name: 'middle', label: 'middle', worktreeName: 'wt-a' }),
      ],
      projectName: 'openspec-ui',
      showArchived: false,
      selectedKey: '',
    });

    expect(items.map((item) => item.label)).toEqual(['WT wt-a']);
    expect(items[0].options.map((option) => option.value)).toEqual([
      'wt-a::add-auth',
      'wt-a::middle',
      'wt-a::zebra',
    ]);
  });

  it('sorts worktree groups alphabetically and main changes alphabetically', () => {
    const items = changePickerItems({
      changes: [
        change({ key: 'zebra', name: 'zebra', label: 'zebra' }),
        change({ key: 'wt-b::new-idea', name: 'new-idea', worktreeName: 'wt-b' }),
        change({ key: 'add-auth', name: 'add-auth', label: 'add-auth' }),
        change({ key: 'wt-a::add-auth', name: 'add-auth', worktreeName: 'wt-a' }),
      ],
      projectName: 'openspec-ui',
      showArchived: false,
      selectedKey: '',
    });

    expect(items.map((item) => item.label)).toEqual(['openspec-ui', 'WT wt-a', 'WT wt-b']);
    expect(items[0].options.map((option) => option.value)).toEqual(['add-auth', 'zebra']);
  });

  it('hides the archived changes until they are asked for', () => {
    const changes = [
      change({ key: 'add-auth', name: 'add-auth' }),
      change({ key: 'old-idea', name: 'old-idea', label: 'old-idea', status: 'archived' }),
    ];

    const hidden = changePickerItems({ changes, projectName: 'p', showArchived: false, selectedKey: '' });
    const shown = changePickerItems({ changes, projectName: 'p', showArchived: true, selectedKey: '' });

    expect(hidden.map((item) => item.label)).toEqual(['p']);
    expect(shown.map((item) => item.label)).toEqual(['p', 'Archived']);
    expect(shown[1].options).toEqual([{ value: 'old-idea', label: 'old-idea' }]);
  });

  it('keeps the selected archived change listed while archived ones are hidden', () => {
    const items = changePickerItems({
      changes: [
        change({ key: 'add-auth', name: 'add-auth' }),
        change({ key: 'old-idea', name: 'old-idea', label: 'old-idea', status: 'archived' }),
        change({ key: 'older-idea', name: 'older-idea', label: 'older-idea', status: 'archived' }),
      ],
      projectName: 'p',
      showArchived: false,
      selectedKey: 'old-idea',
    });

    expect(items.map((item) => item.label)).toEqual(['p', 'Archived']);
    expect(items[1].options).toEqual([{ value: 'old-idea', label: 'old-idea' }]);
  });

  it('keeps archived changes in the order they arrived', () => {
    const items = changePickerItems({
      changes: [
        change({ key: '2026-06-05-newer', name: '2026-06-05-newer', label: 'newer', status: 'archived' }),
        change({ key: '2026-06-04-older', name: '2026-06-04-older', label: 'older', status: 'archived' }),
      ],
      projectName: 'p',
      showArchived: true,
      selectedKey: '',
    });

    expect(items[0].options.map((option) => option.value)).toEqual(['2026-06-05-newer', '2026-06-04-older']);
  });

  it('lists the archived group after every worktree group', () => {
    const items = changePickerItems({
      changes: [
        change({ key: 'old-idea', name: 'old-idea', status: 'archived' }),
        change({ key: 'wt-a::add-auth', name: 'add-auth', worktreeName: 'wt-a' }),
      ],
      projectName: 'p',
      showArchived: true,
      selectedKey: '',
    });

    expect(items.map((item) => item.label)).toEqual(['WT wt-a', 'Archived']);
  });

  it('has nothing to show for a project without changes', () => {
    expect(changePickerItems({ changes: [], projectName: 'p', showArchived: true, selectedKey: '' })).toEqual([]);
  });
});
