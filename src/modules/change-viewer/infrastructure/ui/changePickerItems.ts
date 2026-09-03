import type { SelectGroup, SelectOption } from '../../../../shared/infrastructure/ui/components';
import type { SelectableChangeDto } from '../../application/dtos';

const ARCHIVED_GROUP = 'Archived';

interface PickerInput {
  changes: SelectableChangeDto[];
  projectName: string;
  showArchived: boolean;
  selectedKey: string;
}

// The picker reads as one list per place a change lives: the project itself, then
// each worktree, then the archive. The headings are <optgroup> labels, so a place
// is never selectable — only the changes under it are.
export function changePickerItems(input: PickerInput): SelectGroup[] {
  const visible = input.changes.filter((change) => isVisible(change, input));
  const groups = [
    { label: input.projectName, options: optionsOf(visible.filter(isMainActive)) },
    ...worktreeGroups(visible),
    { label: ARCHIVED_GROUP, options: optionsOf(visible.filter(isArchived)) },
  ];
  return groups.filter((group) => group.options.length > 0);
}

function isVisible(change: SelectableChangeDto, input: PickerInput): boolean {
  if (input.showArchived || change.status !== 'archived') {
    return true;
  }
  // The change being viewed stays listed, so the picker never shows a blank value.
  return change.key === input.selectedKey;
}

function worktreeGroups(changes: SelectableChangeDto[]): SelectGroup[] {
  const names = [...new Set(changes.map((change) => change.worktreeName).filter(isName))];
  return names.map((name) => ({
    label: `WT ${name}`,
    options: optionsOf(changes.filter((change) => change.worktreeName === name)),
  }));
}

function optionsOf(changes: SelectableChangeDto[]): SelectOption[] {
  return changes.map((change) => ({ value: change.key, label: change.label }));
}

function isMainActive(change: SelectableChangeDto): boolean {
  return change.worktreeName === null && change.status !== 'archived';
}

function isArchived(change: SelectableChangeDto): boolean {
  return change.worktreeName === null && change.status === 'archived';
}

function isName(name: string | null): name is string {
  return name !== null;
}
