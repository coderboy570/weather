/**
 * Frontend mirror of the backend's normalized contract
 * (server/src/types/weather.types.ts). Keep the two in sync.
 *
 * All values arrive in metric units: temperature °C, wind km/h, pressure hPa,
 * precipitation mm, visibility metres. The UI converts for display so toggling
 * units never triggers a re-fetch.
 */

export type WeatherIconKey =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'rain-showers'
  | 'snow-showers'
  | 'thunderstorm'
  | 'thunderstorm-hail'
  | 'unknown';

export interface NormalizedLocation {
  name: string;
  country: string | null;
  countryCode: string | null;
  admin1: string | null;
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
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  dewPoint: number | null;
  precipitation: number;
  pressure: number;
  surfacePressure: number | null;
  windSpeed: number;
  windDirection: number;
  windGust: number | null;
  visibility: number | null;
  cloudCover: number | null;
  uvIndex: number | null;
  condition: WeatherCondition;
}

export interface HourlyEntry {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  uvIndex: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  condition: WeatherCondition;
}

export interface DailyEntry {
  date: string;
  tempMax: number;
  tempMin: number;
  apparentMax: number | null;
  apparentMin: number | null;
  sunrise: string;
  sunset: string;
  uvIndexMax: number | null;
  precipitationSum: number | null;
  precipitationProbabilityMax: number | null;
  windSpeedMax: number | null;
  windDirectionDominant: number | null;
  condition: WeatherCondition;
}

export interface WeatherUnits {
  temperature: string;
  windSpeed: string;
  pressure: string;
  precipitation: string;
  visibility: string;
}

export interface WeatherResponse {
  location: NormalizedLocation;
  current: CurrentWeather;
  hourly: HourlyEntry[];
  daily: DailyEntry[];
  units: WeatherUnits;
  fetchedAt: string;
}

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

/** Shape the backend uses for all error responses. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

/** Temperature unit system chosen by the user. */
export type UnitSystem = 'metric' | 'imperial';

/** A saved/recent place — the minimum needed to re-query and render a chip. */
export interface SavedPlace {
  id: number;
  name: string;
  country: string | null;
  countryCode: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
}
