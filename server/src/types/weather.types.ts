/**
 * NORMALIZED weather contract — the clean shape our API returns to the frontend.
 * This deliberately hides the provider's raw structure (parallel arrays, snake
 * case, provider-specific fields). All temperatures are °C, wind is km/h,
 * pressure is hPa, precipitation is mm; the frontend converts units for display.
 *
 * Keep this file in sync with client/src/types/weather.ts (same shape).
 */
import type { WeatherIconKey } from '../utils/weatherCodes';

export type { WeatherIconKey };

export interface NormalizedLocation {
  name: string;
  country: string | null;
  countryCode: string | null; // ISO-3166 alpha-2 (used for flag emoji)
  admin1: string | null; // state / region
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetSeconds: number;
}

export interface WeatherCondition {
  code: number;
  label: string;
  icon: WeatherIconKey;
  isDay: boolean;
}

export interface CurrentWeather {
  time: string; // location-local ISO (no offset suffix)
  temperature: number; // °C
  apparentTemperature: number; // °C ("feels like")
  humidity: number; // %
  dewPoint: number | null; // °C
  precipitation: number; // mm
  pressure: number; // hPa (mean sea level)
  surfacePressure: number | null; // hPa
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGust: number | null; // km/h
  visibility: number | null; // metres
  cloudCover: number | null; // %
  uvIndex: number | null; // index (from the current hour, when available)
  condition: WeatherCondition;
}

export interface HourlyEntry {
  time: string; // location-local ISO
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number | null; // %
  precipitationProbability: number | null; // %
  precipitation: number | null; // mm
  uvIndex: number | null;
  windSpeed: number | null; // km/h
  windDirection: number | null; // degrees
  condition: WeatherCondition;
}

export interface DailyEntry {
  date: string; // location-local date (YYYY-MM-DD)
  tempMax: number; // °C
  tempMin: number; // °C
  apparentMax: number | null; // °C
  apparentMin: number | null; // °C
  sunrise: string; // location-local ISO
  sunset: string; // location-local ISO
  uvIndexMax: number | null;
  precipitationSum: number | null; // mm
  precipitationProbabilityMax: number | null; // %
  windSpeedMax: number | null; // km/h
  windDirectionDominant: number | null; // degrees
  condition: WeatherCondition;
}

export interface WeatherUnits {
  temperature: string; // "°C"
  windSpeed: string; // "km/h"
  pressure: string; // "hPa"
  precipitation: string; // "mm"
  visibility: string; // "m"
}

export interface WeatherResponse {
  location: NormalizedLocation;
  current: CurrentWeather;
  hourly: HourlyEntry[];
  daily: DailyEntry[];
  units: WeatherUnits;
  fetchedAt: string; // server UTC ISO timestamp
}

/** Location suggestion returned by the /api/geo/search endpoint. */
export interface LocationSuggestion {
  id: number;
  name: string;
  country: string | null;
  countryCode: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
  population: number | null;
}
