import { env } from '../config/env';
import { fetchJson } from './openMeteoClient';
import { TtlCache } from '../utils/cache';
import { AppError } from '../utils/AppError';
import { normalizeForecast, applyLocationMeta, toSuggestion } from './normalize';
import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeoResponse,
  OpenMeteoGeoResult,
} from '../types/openMeteo.types';
import type {
  WeatherResponse,
  LocationSuggestion,
  NormalizedLocation,
} from '../types/weather.types';

/* -------------------------------------------------------------------------- */
/*  Caches                                                                     */
/* -------------------------------------------------------------------------- */

const weatherCache = new TtlCache<WeatherResponse>(env.WEATHER_CACHE_TTL_SECONDS * 1000);
const geoSearchCache = new TtlCache<LocationSuggestion[]>(env.GEO_CACHE_TTL_SECONDS * 1000);
const geoResolveCache = new TtlCache<OpenMeteoGeoResult>(env.GEO_CACHE_TTL_SECONDS * 1000);

/** Clears all in-memory caches. Exposed for deterministic tests. */
export function __clearCaches(): void {
  weatherCache.clear();
  geoSearchCache.clear();
  geoResolveCache.clear();
}

// Re-export the pure transform so existing imports/tests keep working.
export { normalizeForecast } from './normalize';

/* -------------------------------------------------------------------------- */
/*  Upstream query definitions                                                 */
/* -------------------------------------------------------------------------- */

const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'visibility',
  'dew_point_2m',
].join(',');

const HOURLY_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
  'is_day',
  'dew_point_2m',
].join(',');

const DAILY_PARAMS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
].join(',');

export interface WeatherQueryInput {
  city?: string;
  lat?: number;
  lon?: number;
}

/* -------------------------------------------------------------------------- */
/*  Geocoding                                                                  */
/* -------------------------------------------------------------------------- */

/** Autocomplete search — returns multiple candidate locations. */
export async function searchLocations(query: string, count = 5): Promise<LocationSuggestion[]> {
  const key = `${query.toLowerCase()}::${count}`;
  const cached = geoSearchCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    name: query,
    count: String(count),
    language: 'en',
    format: 'json',
  });
  const url = `${env.OPEN_METEO_GEOCODING_URL}?${params.toString()}`;
  const data = await fetchJson<OpenMeteoGeoResponse>(url);

  const results = (data.results ?? []).map(toSuggestion);
  geoSearchCache.set(key, results);
  return results;
}

/** Resolve a free-text city to a single best-match location. */
async function resolveCity(city: string): Promise<OpenMeteoGeoResult> {
  const key = city.toLowerCase();
  const cached = geoResolveCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    name: city,
    count: '1',
    language: 'en',
    format: 'json',
  });
  const url = `${env.OPEN_METEO_GEOCODING_URL}?${params.toString()}`;
  const data = await fetchJson<OpenMeteoGeoResponse>(url);

  const first = data.results?.[0];
  if (!first) {
    throw AppError.notFound(
      'Location not found. Please try another location.',
      'LOCATION_NOT_FOUND',
    );
  }
  geoResolveCache.set(key, first);
  return first;
}

/* -------------------------------------------------------------------------- */
/*  Weather                                                                    */
/* -------------------------------------------------------------------------- */

/** Full weather payload (current + hourly + daily) for a city or coordinates. */
export async function getWeather(input: WeatherQueryInput): Promise<WeatherResponse> {
  let lat: number;
  let lon: number;
  let meta: Partial<NormalizedLocation> = {};

  if (input.city) {
    const geo = await resolveCity(input.city);
    lat = geo.latitude;
    lon = geo.longitude;
    meta = {
      name: geo.name,
      country: geo.country ?? null,
      countryCode: geo.country_code ?? null,
      admin1: geo.admin1 ?? null,
    };
  } else if (input.lat !== undefined && input.lon !== undefined) {
    lat = input.lat;
    lon = input.lon;
  } else {
    throw AppError.badRequest('Provide either a city or coordinates.', 'MISSING_QUERY');
  }

  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return applyLocationMeta(cached, meta);

  const url = buildForecastUrl(lat, lon);
  const raw = await fetchJson<OpenMeteoForecastResponse>(url);
  const normalized = normalizeForecast(raw, meta);
  weatherCache.set(cacheKey, normalized);
  return normalized;
}

/** Current-conditions-only view (backs GET /api/weather/current). */
export async function getCurrentWeather(input: WeatherQueryInput) {
  const full = await getWeather(input);
  return {
    location: full.location,
    current: full.current,
    units: full.units,
    fetchedAt: full.fetchedAt,
  };
}

/** Forecast-only view (backs GET /api/weather/forecast). */
export async function getForecast(input: WeatherQueryInput) {
  const full = await getWeather(input);
  return {
    location: full.location,
    hourly: full.hourly,
    daily: full.daily,
    units: full.units,
    fetchedAt: full.fetchedAt,
  };
}

function buildForecastUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_PARAMS,
    hourly: HOURLY_PARAMS,
    daily: DAILY_PARAMS,
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  return `${env.OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}
