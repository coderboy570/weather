/**
 * Helpers for turning API shapes into the compact `SavedPlace` used by
 * favorites + recent searches, and for de-duplicating places consistently.
 */
import type { LocationSuggestion, NormalizedLocation, SavedPlace } from '../types/weather';

/** Stable identity for a place — prefers the provider id, falls back to coords. */
export function placeKey(p: { id?: number; latitude: number; longitude: number }): string {
  if (p.id && p.id > 0) return `id:${p.id}`;
  return `geo:${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}`;
}

export function suggestionToPlace(s: LocationSuggestion): SavedPlace {
  return {
    id: s.id,
    name: s.name,
    country: s.country,
    countryCode: s.countryCode,
    admin1: s.admin1,
    latitude: s.latitude,
    longitude: s.longitude,
  };
}

export function locationToPlace(l: NormalizedLocation, idHint = 0): SavedPlace {
  return {
    id: idHint,
    name: l.name,
    country: l.country,
    countryCode: l.countryCode,
    admin1: l.admin1,
    latitude: l.latitude,
    longitude: l.longitude,
  };
}

export function samePlace(a: SavedPlace, b: SavedPlace): boolean {
  return placeKey(a) === placeKey(b);
}
