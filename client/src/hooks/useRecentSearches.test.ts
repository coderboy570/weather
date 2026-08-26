import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRecentSearches } from './useRecentSearches';
import { makePlace } from '../test/fixtures';

beforeEach(() => window.localStorage.clear());

describe('useRecentSearches', () => {
  it('adds newest first', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.addRecent(makePlace({ id: 1, name: 'A', latitude: 1, longitude: 1 })));
    act(() => result.current.addRecent(makePlace({ id: 2, name: 'B', latitude: 2, longitude: 2 })));
    expect(result.current.recents.map((r) => r.name)).toEqual(['B', 'A']);
  });

  it('de-duplicates and moves an existing entry to the front', () => {
    const { result } = renderHook(() => useRecentSearches());
    const a = makePlace({ id: 1, name: 'A', latitude: 1, longitude: 1 });
    const b = makePlace({ id: 2, name: 'B', latitude: 2, longitude: 2 });
    act(() => result.current.addRecent(a));
    act(() => result.current.addRecent(b));
    act(() => result.current.addRecent(a));
    expect(result.current.recents.map((r) => r.name)).toEqual(['A', 'B']);
  });

  it('caps the list at six entries', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.addRecent(makePlace({ id: i + 1, name: `City ${i}`, latitude: i, longitude: i }));
      }
    });
    expect(result.current.recents).toHaveLength(6);
    expect(result.current.recents[0].name).toBe('City 9');
  });

  it('clears all recents', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.addRecent(makePlace()));
    act(() => result.current.clearRecents());
    expect(result.current.recents).toHaveLength(0);
  });
});
