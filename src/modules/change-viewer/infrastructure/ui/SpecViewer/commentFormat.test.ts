import { describe, it, expect } from 'vitest';
import { initialsOf, relativeTime } from './commentFormat';

describe('initialsOf', () => {
  it('takes initials of the first two words', () => {
    expect(initialsOf('Priya N.')).toBe('PN');
    expect(initialsOf('Marco Diaz')).toBe('MD');
  });

  it('uses the first two letters for a single word', () => {
    expect(initialsOf('You')).toBe('YO');
  });

  it('handles empty input', () => {
    expect(initialsOf('   ')).toBe('?');
  });

  it('handles a single-letter author', () => {
    expect(initialsOf('A')).toBe('A');
  });
});

describe('relativeTime', () => {
  const now = Date.parse('2026-06-05T00:00:00Z');

  it('formats recent times', () => {
    expect(relativeTime('2026-06-05T00:00:00Z', now)).toBe('just now');
    expect(relativeTime('2026-06-04T23:30:00Z', now)).toBe('30m');
    expect(relativeTime('2026-06-04T20:00:00Z', now)).toBe('4h');
    expect(relativeTime('2026-06-03T00:00:00Z', now)).toBe('2d');
    expect(relativeTime('2026-05-22T00:00:00Z', now)).toBe('2w');
  });

  it('handles the bucket boundaries', () => {
    expect(relativeTime('2026-06-04T23:59:01Z', now)).toBe('just now'); // 59s
    expect(relativeTime('2026-06-04T23:59:00Z', now)).toBe('1m'); // 60s
    expect(relativeTime('2026-06-04T01:00:00Z', now)).toBe('23h');
    expect(relativeTime('2026-06-04T00:00:00Z', now)).toBe('1d'); // 24h
    expect(relativeTime('2026-05-30T00:00:00Z', now)).toBe('6d'); // 6d
    expect(relativeTime('2026-05-29T00:00:00Z', now)).toBe('1w'); // 7d → 1w
  });

  it('returns the raw value when unparseable', () => {
    expect(relativeTime('not-a-date', now)).toBe('not-a-date');
  });
});
