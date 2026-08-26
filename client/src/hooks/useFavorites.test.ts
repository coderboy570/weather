import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFavorites } from './useFavorites';
import { STORAGE_KEYS, readJSON } from '../lib/storage';
import { makePlace } from '../test/fixtures';
import type { SavedPlace } from '../types/weather';

beforeEach(() => window.localStorage.clear());

describe('useFavorites', () => {
  it('adds and reports favorite status', () => {
    const { result } = renderHook(() => useFavorites());
    const place = makePlace();

    expect(result.current.isFavorite(place)).toBe(false);
    act(() => result.current.addFavorite(place));
    expect(result.current.isFavorite(place)).toBe(true);
    expect(result.current.favorites).toHaveLength(1);
  });

  it('does not add duplicates (same placeKey)', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(makePlace()));
    act(() => result.current.addFavorite(makePlace({ name: 'Kolkata renamed' })));
    expect(result.current.favorites).toHaveLength(1);
  });

  it('toggles on and off', () => {
    const { result } = renderHook(() => useFavorites());
    const place = makePlace();
    act(() => result.current.toggleFavorite(place));
    expect(result.current.isFavorite(place)).toBe(true);
    act(() => result.current.toggleFavorite(place));
    expect(result.current.isFavorite(place)).toBe(false);
  });

  it('removes a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    const place = makePlace();
    act(() => result.current.addFavorite(place));
    act(() => result.current.removeFavorite(place));
    expect(result.current.favorites).toHaveLength(0);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(makePlace()));
    const stored = readJSON<SavedPlace[]>(STORAGE_KEYS.favorites, []);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Kolkata');
  });

  it('hydrates from localStorage on mount', () => {
    window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([makePlace()]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toHaveLength(1);
  });
});
