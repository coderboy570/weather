/**
 * Partial types describing the *raw* Open-Meteo responses we consume.
 * We only type the fields we request. Open-Meteo returns each variable as a
 * parallel array under `hourly` / `daily`, indexed by the `time` array.
 */

export interface OpenMeteoGeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  country_id?: number;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  timezone?: string;
  population?: number;
  postcodes?: string[];
}

export interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
  generationtime_ms?: number;
}

export interface OpenMeteoCurrent {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  visibility?: number;
  dew_point_2m?: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability?: (number | null)[];
  precipitation?: number[];
  weather_code: number[];
  visibility?: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  uv_index?: (number | null)[];
  is_day: number[];
  dew_point_2m?: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max?: (number | null)[];
  precipitation_sum?: number[];
  precipitation_probability_max?: (number | null)[];
  wind_speed_10m_max?: number[];
  wind_direction_10m_dominant?: number[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current?: OpenMeteoCurrent;
  hourly?: OpenMeteoHourly;
  daily?: OpenMeteoDaily;
}
