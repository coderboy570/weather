import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readString, writeString } from '../lib/storage';

export type Theme = 'light' | 'dark';

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function initialTheme(): Theme {
  const stored = readString(STORAGE_KEYS.theme);
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark() ? 'dark' : 'light';
}

/**
 * Theme state that mirrors the pre-paint script in index.html. Persists the
 * user's explicit choice, and — only while no explicit choice exists — follows
 * the OS preference live.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Apply the theme class to <html> whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Follow the OS preference until the user makes an explicit choice.
  useEffect(() => {
    if (readString(STORAGE_KEYS.theme)) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setThemeState(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    writeString(STORAGE_KEYS.theme, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      writeString(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}
