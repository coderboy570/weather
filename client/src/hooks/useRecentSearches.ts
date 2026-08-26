import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readJSON, writeJSON } from '../lib/storage';
import { placeKey } from '../lib/places';
import type { SavedPlace } from '../types/weather';

const MAX_RECENTS = 6;

/** Persisted most-recent searches, newest first, de-duplicated and capped. */
export function useRecentSearches() {
  const [recents, setRecents] = useState<SavedPlace[]>(() =>
    readJSON<SavedPlace[]>(STORAGE_KEYS.recents, []),
  );

  useEffect(() => {
    writeJSON(STORAGE_KEYS.recents, recents);
  }, [recents]);

  const addRecent = useCallback((place: SavedPlace) => {
    setRecents((prev) => {
      const withoutDupe = prev.filter((p) => placeKey(p) !== placeKey(place));
      return [place, ...withoutDupe].slice(0, MAX_RECENTS);
    });
  }, []);

  const removeRecent = useCallback((place: SavedPlace) => {
    setRecents((prev) => prev.filter((p) => placeKey(p) !== placeKey(place)));
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  return { recents, addRecent, removeRecent, clearRecents };
}
