import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins truthy strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('flattens nested arrays', () => {
    expect(cn(['a', ['b', ['c']]], 'd')).toBe('a b c d');
  });

  it('accepts numbers', () => {
    expect(cn('col', 0, 1)).toBe('col 1');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
