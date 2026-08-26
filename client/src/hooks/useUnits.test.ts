import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUnits } from './useUnits';
import { STORAGE_KEYS, readString } from '../lib/storage';

beforeEach(() => window.localStorage.clear());

describe('useUnits', () => {
  it('defaults to metric', () => {
    const { result } = renderHook(() => useUnits());
    expect(result.current.system).toBe('metric');
    expect(result.current.isMetric).toBe(true);
  });

  it('toggles between metric and imperial and persists', () => {
    const { result } = renderHook(() => useUnits());
    act(() => result.current.toggle());
    expect(result.current.system).toBe('imperial');
    expect(readString(STORAGE_KEYS.units)).toBe('imperial');
    act(() => result.current.toggle());
    expect(result.current.system).toBe('metric');
  });

  it('sets a specific system', () => {
    const { result } = renderHook(() => useUnits());
    act(() => result.current.setSystem('imperial'));
    expect(result.current.system).toBe('imperial');
  });

  it('hydrates from storage', () => {
    window.localStorage.setItem(STORAGE_KEYS.units, 'imperial');
    const { result } = renderHook(() => useUnits());
    expect(result.current.system).toBe('imperial');
  });
});
