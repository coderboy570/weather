/**
 * Realistic *mock* Open-Meteo responses, shaped exactly like the live API.
 * Used by automated tests so they never hit the network (no API credits, fully
 * deterministic). This is test-fixture data — NOT used by the running app.
 */
import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeoResponse,
} from '../../types/openMeteo.types';

const HOURS = 48;
const DAYS = 7;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// 48 hourly timestamps starting at local midnight on 2026-08-25.
const hourlyTime: string[] = Array.from({ length: HOURS }, (_, i) => {
  const day = 25 + Math.floor(i / 24);
  const hour = i % 24;
  return `2026-08-${pad(day)}T${pad(hour)}:00`;
});

const dailyTime: string[] = Array.from(
  { length: DAYS },
  (_, i) => `2026-08-${pad(25 + i)}`,
);

function series(length: number, fn: (i: number) => number): number[] {
  return Array.from({ length }, (_, i) => fn(i));
}

export const forecastFixture: OpenMeteoForecastResponse = {
  latitude: 22.57,
  longitude: 88.36,
  generationtime_ms: 0.42,
  utc_offset_seconds: 19_800, // +05:30 (Asia/Kolkata)
  timezone: 'Asia/Kolkata',
  timezone_abbreviation: 'IST',
  elevation: 8,
  current: {
    time: '2026-08-25T12:00',
    interval: 900,
    temperature_2m: 30.4,
    relative_humidity_2m: 74,
    apparent_temperature: 36.1,
    is_day: 1,
    precipitation: 0.2,
    weather_code: 2, // partly cloudy
    cloud_cover: 62,
    pressure_msl: 1004.6,
    surface_pressure: 1003.7,
    wind_speed_10m: 14.8,
    wind_direction_10m: 190,
    wind_gusts_10m: 28.4,
    visibility: 17_000,
    dew_point_2m: 25.1,
  },
  hourly: {
    time: hourlyTime,
    temperature_2m: series(HOURS, (i) => 27 + (i % 12)),
    relative_humidity_2m: series(HOURS, (i) => 60 + (i % 30)),
    apparent_temperature: series(HOURS, (i) => 30 + (i % 10)),
    precipitation_probability: series(HOURS, (i) => (i % 10) * 10),
    precipitation: series(HOURS, (i) => (i % 5) * 0.4),
    weather_code: series(HOURS, (i) => [0, 1, 2, 3, 61, 80, 95][i % 7]),
    visibility: series(HOURS, () => 20_000),
    wind_speed_10m: series(HOURS, (i) => 10 + (i % 15)),
    wind_direction_10m: series(HOURS, (i) => (i * 15) % 360),
    uv_index: series(HOURS, (i) => Math.max(0, 8 - Math.abs(12 - (i % 24)))),
    is_day: series(HOURS, (i) => (i % 24 >= 6 && i % 24 <= 18 ? 1 : 0)),
    dew_point_2m: series(HOURS, (i) => 23 + (i % 4)),
  },
  daily: {
    time: dailyTime,
    weather_code: series(DAYS, (i) => [0, 2, 3, 61, 80, 95, 1][i % 7]),
    temperature_2m_max: series(DAYS, (i) => 32 + (i % 3)),
    temperature_2m_min: series(DAYS, (i) => 25 + (i % 2)),
    apparent_temperature_max: series(DAYS, (i) => 37 + (i % 3)),
    apparent_temperature_min: series(DAYS, (i) => 27 + (i % 2)),
    sunrise: dailyTime.map((d) => `${d}T05:1${0}`),
    sunset: dailyTime.map((d) => `${d}T18:0${5}`),
    uv_index_max: series(DAYS, () => 9),
    precipitation_sum: series(DAYS, (i) => i * 1.5),
    precipitation_probability_max: series(DAYS, (i) => (i % 10) * 10),
    wind_speed_10m_max: series(DAYS, (i) => 20 + i),
    wind_direction_10m_dominant: series(DAYS, (i) => (i * 30) % 360),
  },
};

export const geoFixture: OpenMeteoGeoResponse = {
  results: [
    {
      id: 1275004,
      name: 'Kolkata',
      latitude: 22.56263,
      longitude: 88.36304,
      elevation: 8,
      feature_code: 'PPLA',
      country_code: 'IN',
      country: 'India',
      country_id: 1269750,
      admin1: 'West Bengal',
      admin2: 'Kolkata',
      timezone: 'Asia/Kolkata',
      population: 4_631_392,
    },
    {
      id: 1275005,
      name: 'Kolkata (alt)',
      latitude: 22.5,
      longitude: 88.3,
      country_code: 'IN',
      country: 'India',
      admin1: 'West Bengal',
      timezone: 'Asia/Kolkata',
      population: 1000,
    },
  ],
  generationtime_ms: 0.3,
};

export const emptyGeoFixture: OpenMeteoGeoResponse = {
  generationtime_ms: 0.1,
};

/** Build a `Response`-like object for a mocked global fetch. */
export function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as unknown as Response;
}
