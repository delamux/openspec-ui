import { describe, it, expect } from 'vitest';
import { EnvProjectsRootProvider } from './EnvProjectsRootProvider';
import { DomainError } from '../../../../shared/domain/DomainError';

describe('EnvProjectsRootProvider', () => {
  it('returns the configured absolute path', async () => {
    const provider = new EnvProjectsRootProvider('/Users/me/code');

    expect((await provider.find()).getOrThrow().path).toBe('/Users/me/code');
  });

  it('trims surrounding whitespace from the env value', async () => {
    const provider = new EnvProjectsRootProvider('  /Users/me/code  ');

    expect((await provider.find()).getOrThrow().path).toBe('/Users/me/code');
  });

  it('returns none when the variable is unset', async () => {
    expect((await new EnvProjectsRootProvider(undefined).find()).isNone()).toBe(true);
  });

  it('returns none when the variable is empty', async () => {
    expect((await new EnvProjectsRootProvider('   ').find()).isNone()).toBe(true);
  });

  it('rejects a non-absolute configured path', async () => {
    const provider = new EnvProjectsRootProvider('relative/code');

    await expect(provider.find()).rejects.toBeInstanceOf(DomainError);
  });
});
