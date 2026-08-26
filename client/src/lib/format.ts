/**
 * Pure formatting + unit-conversion helpers. No React, no I/O — this is the
 * module the unit tests exercise most heavily.
 *
 * IMPORTANT (timezone correctness): the backend returns times that are already
 * in the LOCATION's local wall-clock, as naive ISO strings without an offset
 * (e.g. "2026-08-25T13:00"). We must display those numbers as-is, regardless of
 * the viewer's own timezone. To do that we parse the naive string into a
 * UTC-anchored Date and always format with `timeZone: 'UTC'`, which reproduces
 * the exact wall-clock the provider reported for that location.
 */
import type { NormalizedLocation, UnitSystem } from '../types/weather';

/* ------------------------------ numbers ---------------------------------- */

export function roundTo(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/* --------------------------- temperature ---------------------------------- */

export function convertTemp(celsius: number, system: UnitSystem): number {
  return system === 'imperial' ? celsius * (9 / 5) + 32 : celsius;
}

export function tempUnitLabel(system: UnitSystem): string {
  return system === 'imperial' ? '°F' : '°C';
}

/** Temperature with a trailing degree sign but no unit letter (e.g. "30°"). */
export function formatTemp(
  celsius: number | null | undefined,
  system: UnitSystem,
  decimals = 0,
): string {
  if (celsius == null || Number.isNaN(celsius)) return '—';
  return `${roundTo(convertTemp(celsius, system), decimals)}°`;
}

/** Temperature including the unit letter (e.g. "30°C"). */
export function formatTempWithUnit(
  celsius: number | null | undefined,
  system: UnitSystem,
  decimals = 0,
): string {
  if (celsius == null || Number.isNaN(celsius)) return '—';
  return `${roundTo(convertTemp(celsius, system), decimals)}${tempUnitLabel(system)}`;
}

/* ------------------------------- wind ------------------------------------- */

const KMH_TO_MPH = 0.621371;

export function convertWind(kmh: number, system: UnitSystem): number {
  return system === 'imperial' ? kmh * KMH_TO_MPH : kmh;
}

export function windUnitLabel(system: UnitSystem): string {
  return system === 'imperial' ? 'mph' : 'km/h';
}

export function formatWind(
  kmh: number | null | undefined,
  system: UnitSystem,
): string {
  if (kmh == null || Number.isNaN(kmh)) return '—';
  return `${roundTo(convertWind(kmh, system))} ${windUnitLabel(system)}`;
}

/* ---------------------------- visibility ---------------------------------- */

const M_TO_MILES = 1 / 1609.344;

export function formatVisibility(
  meters: number | null | undefined,
  system: UnitSystem,
): string {
  if (meters == null || Number.isNaN(meters)) return '—';
  if (system === 'imperial') {
    return `${roundTo(meters * M_TO_MILES, 1)} mi`;
  }
  return `${roundTo(meters / 1000, 1)} km`;
}

/* -------------------------- pressure / precip ----------------------------- */

export function formatPressure(hPa: number | null | undefined): string {
  if (hPa == null || Number.isNaN(hPa)) return '—';
  return `${roundTo(hPa)} hPa`;
}

export function formatPrecip(mm: number | null | undefined): string {
  if (mm == null || Number.isNaN(mm)) return '—';
  return `${roundTo(mm, 1)} mm`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${roundTo(value)}%`;
}

/* ------------------------------ wind dir ---------------------------------- */

const COMPASS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** 16-point compass abbreviation for a bearing in degrees (mirrors backend). */
export function degreesToCompass(deg: number | null | undefined): string {
  if (deg == null || Number.isNaN(deg)) return '—';
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_16[index];
}

export function formatWindDirection(deg: number | null | undefined): string {
  if (deg == null || Number.isNaN(deg)) return '—';
  return `${degreesToCompass(deg)} · ${roundTo(deg)}°`;
}

/* -------------------------------- UV -------------------------------------- */

export type UvLevel = 'none' | 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

export function uvCategory(uv: number | null | undefined): { label: string; level: UvLevel } {
  if (uv == null || Number.isNaN(uv)) return { label: '—', level: 'none' };
  if (uv < 3) return { label: 'Low', level: 'low' };
  if (uv < 6) return { label: 'Moderate', level: 'moderate' };
  if (uv < 8) return { label: 'High', level: 'high' };
  if (uv < 11) return { label: 'Very high', level: 'very-high' };
  return { label: 'Extreme', level: 'extreme' };
}

export function formatUv(uv: number | null | undefined): string {
  if (uv == null || Number.isNaN(uv)) return '—';
  return String(roundTo(uv));
}

/* ------------------------------- flags ------------------------------------ */

/** Convert an ISO-3166 alpha-2 code into its regional-indicator flag emoji. */
export function countryCodeToFlag(cc: string | null | undefined): string {
  if (!cc || !/^[a-zA-Z]{2}$/.test(cc)) return '';
  const BASE = 0x1f1e6;
  const up = cc.toUpperCase();
  return String.fromCodePoint(BASE + up.charCodeAt(0) - 65, BASE + up.charCodeAt(1) - 65);
}

/* ---------------------------- place labels -------------------------------- */

/** "Kolkata, West Bengal, India" — skips missing parts. */
export function formatPlaceLine(
  location: Pick<NormalizedLocation, 'name' | 'admin1' | 'country'>,
): string {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

/** "Kolkata, India" — a shorter, chip-friendly label. */
export function formatPlaceShort(
  location: Pick<NormalizedLocation, 'name' | 'country' | 'countryCode'>,
): string {
  const region = location.country ?? location.countryCode ?? '';
  return region ? `${location.name}, ${region}` : location.name;
}

/* ---------------------------- date & time --------------------------------- */

/**
 * Parse a naive location-local ISO string into a UTC-anchored Date so that
 * formatting with `timeZone: 'UTC'` reproduces the location's wall-clock.
 */
export function parseLocalIso(iso: string): Date {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return new Date(NaN);
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
}

function fmt(iso: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseLocalIso(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(date);
}

/** "1:05 PM" */
export function formatClock(iso: string): string {
  return fmt(iso, { hour: 'numeric', minute: '2-digit' });
}

/** "1 PM" — compact label for the hourly strip. */
export function formatHour(iso: string): string {
  return fmt(iso, { hour: 'numeric' });
}

/** "Mon" */
export function formatWeekday(iso: string): string {
  return fmt(iso, { weekday: 'short' });
}

/** "Monday" */
export function formatWeekdayLong(iso: string): string {
  return fmt(iso, { weekday: 'long' });
}

/** "Aug 25" */
export function formatMonthDay(iso: string): string {
  return fmt(iso, { month: 'short', day: 'numeric' });
}

/** "Monday, August 25" */
export function formatFullDate(iso: string): string {
  return fmt(iso, { weekday: 'long', month: 'long', day: 'numeric' });
}

/* --------------------- location-local "now" clock ------------------------- */

/** A Date whose UTC fields equal the location's current wall-clock. */
export function locationNow(utcOffsetSeconds: number, base: number = Date.now()): Date {
  return new Date(base + utcOffsetSeconds * 1000);
}

/** Live "1:05 PM" clock for the location. */
export function formatLocationClock(utcOffsetSeconds: number, base: number = Date.now()): string {
  const d = locationNow(utcOffsetSeconds, base);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

/** Location-local calendar date as YYYY-MM-DD (for "Today" detection). */
export function locationDateKey(utcOffsetSeconds: number, base: number = Date.now()): string {
  const d = locationNow(utcOffsetSeconds, base);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** "Today" if the daily date equals the location's local date, else weekday. */
export function dayLabel(dateIso: string, utcOffsetSeconds: number, base: number = Date.now()): string {
  const dateKey = dateIso.slice(0, 10);
  return dateKey === locationDateKey(utcOffsetSeconds, base) ? 'Today' : formatWeekday(dateIso);
}

/** Human "as of" line, e.g. "Updated 1:05 PM local time". */
export function formatUpdatedLabel(currentTimeIso: string): string {
  return `Updated ${formatClock(currentTimeIso)} local time`;
}
