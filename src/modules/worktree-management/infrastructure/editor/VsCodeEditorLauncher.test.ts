import { describe, it, expect } from 'vitest';
import { VsCodeEditorLauncher } from './VsCodeEditorLauncher';
import { DomainError } from '../../../../shared/domain/DomainError';

describe('VsCodeEditorLauncher', () => {
  it('surfaces a domain error when the editor command is not on PATH', async () => {
    const launcher = new VsCodeEditorLauncher('openspec-ui-no-such-binary-xyz');

    await expect(launcher.open('/tmp/whatever')).rejects.toThrow(DomainError);
  });
});
