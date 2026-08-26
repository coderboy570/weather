import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeForecast,
  getWeather,
  searchLocations,
  __clearCaches,
} from '../services/weatherService';
import {
  forecastFixture,
  geoFixture,
  emptyGeoFixture,
  jsonResponse,
} from './fixtures/openMeteo.fixture';

describe('normalizeForecast (pure transform)', () => {
  it('maps current conditions, units and location meta', () => {
    const r = normalizeForecast(forecastFixture, {
      name: 'Kolkata',
      country: 'India',
      countryCode: 'IN',
      admin1: 'West Bengal',
    });
    expect(r.location.name).toBe('Kolkata');
    expect(r.location.country).toBe('India');
    expect(r.location.timezone).toBe('Asia/Kolkata');
    expect(r.location.utcOffsetSeconds).toBe(19_800);
    expect(r.current.temperature).toBe(30.4);
    expect(r.current.apparentTemperature).toBe(36.1);
    expect(r.current.humidity).toBe(74);
    expect(r.current.dewPoint).toBe(25.1);
    expect(r.current.condition.label).toBe('Partly cloudy');
    expect(r.current.condition.icon).toBe('partly-cloudy');
    expect(r.current.condition.isDay).toBe(true);
    expect(r.units).toEqual({
      temperature: '°C',
      windSpeed: 'km/h',
      pressure: 'hPa',
      precipitation: 'mm',
      visibility: 'm',
    });
  });

  it('derives the current UV index from the matching hour', () => {
    // current.time is 12:00 => hour index 12 => uv = max(0, 8 - |12-12|) = 8
    const r = normalizeForecast(forecastFixture);
    expect(r.current.uvIndex).toBe(8);
  });

  it('returns 24 hourly entries starting at the current hour', () => {
    const r = normalizeForecast(forecastFixture);
    expect(r.hourly).toHaveLength(24);
    expect(r.hourly[0].time).toBe('2026-08-25T12:00');
    expect(typeof r.hourly[0].precipitationProbability).toBe('number');
  });

  it('returns 7 daily entries with sunrise/sunset', () => {
    const r = normalizeForecast(forecastFixture);
    expect(r.daily).toHaveLength(7);
    expect(r.daily[0].date).toBe('2026-08-25');
    expect(r.daily[0].sunrise).toContain('T05:');
    expect(r.daily[0].sunset).toContain('T18:');
  });

  it('falls back to a timezone-derived name when no meta is supplied', () => {
    const r = normalizeForecast(forecastFixture);
    expect(r.location.name).toBe('Kolkata'); // from "Asia/Kolkata"
    expect(r.location.country).toBeNull();
  });

  it('throws a sanitized error when required data blocks are missing', () => {
    expect(() => normalizeForecast({ ...forecastFixture, current: undefined })).toThrowError(
      /unavailable/i,
    );
  });
});

describe('getWeather (mocked fetch)', () => {
  beforeEach(() => __clearCaches());
  afterEach(() => vi.unstubAllGlobals());

  it('geocodes a city then fetches and normalizes the forecast', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes('geocoding') ? jsonResponse(geoFixture) : jsonResponse(forecastFixture),
    );
    vi.stubGlobal('fetch', fetchMock);

    const r = await getWeather({ city: 'Kolkata' });
    expect(r.location.name).toBe('Kolkata');
    expect(r.location.country).toBe('India');
    expect(r.current.temperature).toBe(30.4);
    expect(fetchMock).toHaveBeenCalledTimes(2); // geocode + forecast
  });

  it('throws LOCATION_NOT_FOUND (404) for an unknown city', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(emptyGeoFixture)));
    await expect(getWeather({ city: 'zzzznotacity' })).rejects.toMatchObject({
      code: 'LOCATION_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('caches repeated coordinate lookups (a single upstream call)', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(forecastFixture));
    vi.stubGlobal('fetch', fetchMock);
    await getWeather({ lat: 22.5726, lon: 88.3639 });
    await getWeather({ lat: 22.5726, lon: 88.3639 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps an upstream timeout/failure to a sanitized 503', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNRESET');
      }),
    );
    await expect(getWeather({ lat: 10, lon: 10 })).rejects.toMatchObject({
      statusCode: 503,
    });
  });
});

describe('searchLocations (mocked fetch)', () => {
  beforeEach(() => __clearCaches());
  afterEach(() => vi.unstubAllGlobals());

  it('maps geocoding results into clean suggestions', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(geoFixture)));
    const results = await searchLocations('Kolkata', 5);
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      name: 'Kolkata',
      countryCode: 'IN',
      admin1: 'West Bengal',
      country: 'India',
    });
  });

  it('returns an empty array when there are no matches', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(emptyGeoFixture)));
    const results = await searchLocations('zzzznotacity', 5);
    expect(results).toEqual([]);
  });
});
