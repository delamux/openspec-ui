import { describe, it, expect } from 'vitest';
import { Maybe } from './Maybe';

describe('Maybe', () => {
  it('reports a present value as some', () => {
    const maybe = Maybe.some(42);

    expect(maybe.isSome()).toBe(true);
    expect(maybe.isNone()).toBe(false);
  });

  it('reports an absent value as none', () => {
    const maybe = Maybe.none<number>();

    expect(maybe.isNone()).toBe(true);
    expect(maybe.isSome()).toBe(false);
  });

  it('builds none from null or undefined', () => {
    expect(Maybe.fromNullable(null).isNone()).toBe(true);
    expect(Maybe.fromNullable(undefined).isNone()).toBe(true);
    expect(Maybe.fromNullable(0).isSome()).toBe(true);
  });

  it('folds to the matching branch', () => {
    const present = Maybe.some('value').fold(() => 'none', (value) => value);
    const absent = Maybe.none<string>().fold(() => 'none', (value) => value);

    expect(present).toBe('value');
    expect(absent).toBe('none');
  });

  it('maps over a present value and skips an absent one', () => {
    expect(Maybe.some(2).map((value) => value * 2).getOrThrow()).toBe(4);
    expect(Maybe.none<number>().map((value) => value * 2).isNone()).toBe(true);
  });

  it('returns the fallback for none with getOrElse', () => {
    expect(Maybe.none<number>().getOrElse(7)).toBe(7);
    expect(Maybe.some(3).getOrElse(7)).toBe(3);
  });

  it('throws when getOrThrow is called on none', () => {
    expect(() => Maybe.none<number>().getOrThrow()).toThrow();
  });
});
