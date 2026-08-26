import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS, readJSON, readString, writeJSON, writeString } from './storage';

beforeEach(() => {
  window.localStorage.clear();
});

describe('STORAGE_KEYS', () => {
  it('namespaces every key under "skyline:"', () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key.startsWith('skyline:')).toBe(true);
    }
  });
});

describe('JSON storage', () => {
  it('round-trips a value', () => {
    writeJSON(STORAGE_KEYS.favorites, [{ name: 'Kolkata' }]);
    expect(readJSON(STORAGE_KEYS.favorites, [])).toEqual([{ name: 'Kolkata' }]);
  });

  it('returns the fallback when the key is absent', () => {
    expect(readJSON('skyline:missing', { ok: true })).toEqual({ ok: true });
  });

  it('returns the fallback when the stored value is invalid JSON', () => {
    window.localStorage.setItem('skyline:broken', '{not json');
    expect(readJSON('skyline:broken', 'fallback')).toBe('fallback');
  });
});

describe('string storage', () => {
  it('round-trips a string', () => {
    writeString(STORAGE_KEYS.theme, 'dark');
    expect(readString(STORAGE_KEYS.theme)).toBe('dark');
  });

  it('returns null when absent', () => {
    expect(readString('skyline:none')).toBeNull();
  });
});
