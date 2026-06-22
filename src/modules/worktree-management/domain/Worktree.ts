import { DomainError } from '../../../shared/domain/DomainError';
import { Maybe } from '../../../shared/domain/Maybe';

const CHANGE_BRANCH = /^change\/(.+)$/;

export class Worktree {
  private constructor(
    readonly path: string,
    readonly branch: Maybe<string>,
    readonly isMain: boolean,
  ) {}

  static create(path: string, branch: Maybe<string>, isMain: boolean): Worktree {
    if (!path.startsWith('/')) {
      throw DomainError.createValidation(`Worktree path must be absolute: "${path}"`);
    }
    return new Worktree(path, branch, isMain);
  }

  isDetached(): boolean {
    return this.branch.isNone();
  }

  changeName(): Maybe<string> {
    return this.branch.fold(
      () => Maybe.none<string>(),
      (name) => {
        const match = CHANGE_BRANCH.exec(name);
        return match === null ? Maybe.none<string>() : Maybe.some(match[1]);
      },
    );
  }

  ensureRemovable(): void {
    if (this.isMain) {
      throw DomainError.createValidation('The main checkout cannot be removed');
    }
  }
}
