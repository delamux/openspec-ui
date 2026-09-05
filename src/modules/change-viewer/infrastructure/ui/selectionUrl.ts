import type { SelectableChangeDto } from '../../application/dtos';

export interface BrowserSelection {
  projectPath: string;
  changeName: string;
  worktreeName: string;
}

export function selectionFromSearch(search: string): BrowserSelection {
  const params = new URLSearchParams(search);
  return {
    projectPath: params.get('project') ?? '',
    changeName: params.get('change') ?? '',
    worktreeName: params.get('worktree') ?? '',
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
