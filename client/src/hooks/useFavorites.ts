import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readJSON, writeJSON } from '../lib/storage';
import { placeKey } from '../lib/places';
import type { SavedPlace } from '../types/weather';

const MAX_FAVORITES = 24;

/** Persisted list of favorite places with add/remove/toggle helpers. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<SavedPlace[]>(() =>
    readJSON<SavedPlace[]>(STORAGE_KEYS.favorites, []),
  );

  useEffect(() => {
    writeJSON(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (place: SavedPlace) => favorites.some((f) => placeKey(f) === placeKey(place)),
    [favorites],
  );

  const addFavorite = useCallback((place: SavedPlace) => {
    setFavorites((prev) => {
      if (prev.some((f) => placeKey(f) === placeKey(place))) return prev;
      return [place, ...prev].slice(0, MAX_FAVORITES);
    });
  }, []);

  const removeFavorite = useCallback((place: SavedPlace) => {
    setFavorites((prev) => prev.filter((f) => placeKey(f) !== placeKey(place)));
  }, []);

  const toggleFavorite = useCallback((place: SavedPlace) => {
    setFavorites((prev) => {
      if (prev.some((f) => placeKey(f) === placeKey(place))) {
        return prev.filter((f) => placeKey(f) !== placeKey(place));
      }
      return [place, ...prev].slice(0, MAX_FAVORITES);
    });
  }, []);

  return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
