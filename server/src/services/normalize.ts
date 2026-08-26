/**
 * Pure transforms from the raw Open-Meteo shape to our normalized contract.
 * This module has NO I/O and NO external dependencies, which keeps it easy to
 * unit-test and reason about. `weatherService.ts` handles fetching + caching
 * and delegates all shaping to the functions here.
 */
import { AppError } from '../utils/AppError';
import { describeWeatherCode } from '../utils/weatherCodes';
import { placeNameFromTimezone } from '../utils/geo';
import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeoResult,
} from '../types/openMeteo.types';
import type {
  WeatherResponse,
  LocationSuggestion,
  NormalizedLocation,
  CurrentWeather,
  HourlyEntry,
  DailyEntry,
  WeatherCondition,
} from '../types/weather.types';

/** Upcoming hours to expose to the UI. */
export const HOURLY_WINDOW = 24;

export function toSuggestion(r: OpenMeteoGeoResult): LocationSuggestion {
  return {
    id: r.id,
    name: r.name,
    country: r.country ?? null,
    countryCode: r.country_code ?? null,
    admin1: r.admin1 ?? null,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? null,
    population: r.population ?? null,
  };
}

export function normalizeForecast(
  raw: OpenMeteoForecastResponse,
  meta: Partial<NormalizedLocation> = {},
): WeatherResponse {
  if (!raw.current || !raw.hourly || !raw.daily) {
    throw AppError.badGateway('Weather data is currently unavailable for this location.');
  }

  const location: NormalizedLocation = {
    name: meta.name ?? placeNameFromTimezone(raw.timezone),
    country: meta.country ?? null,
    countryCode: meta.countryCode ?? null,
    admin1: meta.admin1 ?? null,
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone,
    utcOffsetSeconds: raw.utc_offset_seconds,
  };

  return {
    location,
    current: normalizeCurrent(raw),
    hourly: normalizeHourly(raw),
    daily: normalizeDaily(raw),
    units: {
      temperature: '°C',
      windSpeed: 'km/h',
      pressure: 'hPa',
      precipitation: 'mm',
      visibility: 'm',
    },
    fetchedAt: new Date().toISOString(),
  };
}

export function applyLocationMeta(
  base: WeatherResponse,
  meta: Partial<NormalizedLocation>,
): WeatherResponse {
  if (!meta.name && !meta.country && !meta.countryCode && !meta.admin1) return base;
  return {
    ...base,
    location: {
      ...base.location,
      name: meta.name ?? base.location.name,
      country: meta.country ?? base.location.country,
      countryCode: meta.countryCode ?? base.location.countryCode,
      admin1: meta.admin1 ?? base.location.admin1,
    },
  };
}

function toCondition(code: number, isDay: boolean): WeatherCondition {
  const info = describeWeatherCode(code);
  return { code, label: info.label, icon: info.icon, isDay };
}

function normalizeCurrent(raw: OpenMeteoForecastResponse): CurrentWeather {
  const c = raw.current!;
  return {
    time: c.time,
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    dewPoint: c.dew_point_2m ?? null,
    precipitation: c.precipitation,
    pressure: c.pressure_msl,
    surfacePressure: c.surface_pressure ?? null,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    windGust: c.wind_gusts_10m ?? null,
    visibility: c.visibility ?? null,
    cloudCover: c.cloud_cover ?? null,
    uvIndex: currentUvFromHourly(raw),
    condition: toCondition(c.weather_code, c.is_day === 1),
  };
}

function normalizeHourly(raw: OpenMeteoForecastResponse): HourlyEntry[] {
  const h = raw.hourly!;
  const start = findHourIndex(h.time, raw.current?.time);
  const end = Math.min(start + HOURLY_WINDOW, h.time.length);
  const out: HourlyEntry[] = [];

  for (let i = start; i < end; i++) {
    out.push({
      time: h.time[i],
      temperature: h.temperature_2m[i],
      apparentTemperature: h.apparent_temperature[i],
      humidity: h.relative_humidity_2m?.[i] ?? null,
      precipitationProbability: h.precipitation_probability?.[i] ?? null,
      precipitation: h.precipitation?.[i] ?? null,
      uvIndex: h.uv_index?.[i] ?? null,
      windSpeed: h.wind_speed_10m?.[i] ?? null,
      windDirection: h.wind_direction_10m?.[i] ?? null,
      condition: toCondition(h.weather_code[i], (h.is_day?.[i] ?? 1) === 1),
    });
  }
  return out;
}

function normalizeDaily(raw: OpenMeteoForecastResponse): DailyEntry[] {
  const d = raw.daily!;
  const out: DailyEntry[] = [];

  for (let i = 0; i < d.time.length; i++) {
    out.push({
      date: d.time[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      apparentMax: d.apparent_temperature_max?.[i] ?? null,
      apparentMin: d.apparent_temperature_min?.[i] ?? null,
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
      uvIndexMax: d.uv_index_max?.[i] ?? null,
      precipitationSum: d.precipitation_sum?.[i] ?? null,
      precipitationProbabilityMax: d.precipitation_probability_max?.[i] ?? null,
      windSpeedMax: d.wind_speed_10m_max?.[i] ?? null,
      windDirectionDominant: d.wind_direction_10m_dominant?.[i] ?? null,
      condition: toCondition(d.weather_code[i], true),
    });
  }
  return out;
}

/** UV isn't a "current" field in Open-Meteo, so read it from the current hour. */
function currentUvFromHourly(raw: OpenMeteoForecastResponse): number | null {
  const h = raw.hourly;
  if (!h?.uv_index || !h.time.length || !raw.current) return null;
  const idx = findHourIndex(h.time, raw.current.time);
  return h.uv_index[idx] ?? null;
}

/** Match "YYYY-MM-DDTHH" to align the current time with the hourly series. */
export function findHourIndex(times: string[], currentTime?: string): number {
  if (!currentTime) return 0;
  const targetHour = currentTime.slice(0, 13);
  const idx = times.findIndex((t) => t.slice(0, 13) === targetHour);
  return idx === -1 ? 0 : idx;
}
