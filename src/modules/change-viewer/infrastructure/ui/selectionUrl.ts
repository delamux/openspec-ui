import type { SelectableChangeDto } from '../../application/dtos';
import { DEFAULT_SPEC_TAB, specTabFrom, type SpecTab } from './SpecViewer/specTabs';

export interface BrowserSelection {
  projectPath: string;
  changeName: string;
  worktreeName: string;
  tab: SpecTab;
}

export function selectionFromSearch(search: string): BrowserSelection {
  const params = new URLSearchParams(search);
  return {
    projectPath: params.get('project') ?? '',
    changeName: params.get('change') ?? '',
    worktreeName: params.get('worktree') ?? '',
    tab: specTabFrom(params.get('tab') ?? ''),
  };
}

export function searchFromSelection(selection: BrowserSelection): string {
  const params = new URLSearchParams();
  if (selection.projectPath) {
    params.set('project', selection.projectPath);
  }
  if (selection.changeName) {
    params.set('change', selection.changeName);
  }
  if (selection.worktreeName) {
    params.set('worktree', selection.worktreeName);
  }
  if (selection.changeName && selection.tab !== DEFAULT_SPEC_TAB) {
    params.set('tab', selection.tab);
  }
  const query = params.toString();
  return query === '' ? '' : `?${query}`;
}

export function matchSelectableChange(
  changes: SelectableChangeDto[],
  changeName: string,
  worktreeName: string,
): SelectableChangeDto | undefined {
  if (changeName === '') {
    return undefined;
  }
  if (worktreeName === '') {
    return changes.find((change) => change.name === changeName && change.worktreeName === null);
  }
  return changes.find((change) => change.name === changeName && change.worktreeName === worktreeName);
}
