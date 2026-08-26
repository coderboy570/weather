/**
 * Safe, typed wrappers around localStorage. Every access is guarded so the app
 * still works when storage is unavailable (private mode, SSR, quota errors) —
 * it simply falls back to in-memory defaults.
 */

export const STORAGE_KEYS = {
  theme: 'skyline:theme',
  units: 'skyline:units',
  favorites: 'skyline:favorites',
  recents: 'skyline:recents',
  lastPlace: 'skyline:lastPlace',
} as const;

function isStorageAvailable(): boolean {
  try {
    const k = '__skyline_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const available = typeof window !== 'undefined' && isStorageAvailable();

export function readJSON<T>(key: string, fallback: T): T {
  if (!available) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!available) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function readString(key: string): string | null {
  if (!available) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  if (!available) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
