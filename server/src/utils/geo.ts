/** Small geo/formatting helpers with no external dependencies. */

const COMPASS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

/** Convert a wind bearing in degrees to a 16-point compass abbreviation. */
export function degreesToCompass(deg: number | null | undefined): string {
  if (deg == null || !Number.isFinite(deg)) return '—';
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_16[index];
}

/**
 * Derive a friendly place name from an IANA timezone, e.g. "Asia/Kolkata" ->
 * "Kolkata". Used only as a fallback label for coordinate-based ("use my
 * location") lookups, where the forecast API returns no place name. This is
 * derived from real API data (the timezone), not fabricated.
 */
export function placeNameFromTimezone(tz: string | undefined | null): string {
  if (!tz) return 'Selected location';
  const parts = tz.split('/');
  const last = parts[parts.length - 1] ?? tz;
  return last.replace(/_/g, ' ');
}
