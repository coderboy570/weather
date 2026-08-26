import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { __clearCaches } from '../services/weatherService';
import {
  forecastFixture,
  geoFixture,
  emptyGeoFixture,
  jsonResponse,
} from './fixtures/openMeteo.fixture';

const app = createApp();

/** Route geocoding vs forecast requests to the right fixture. */
function routedFetch() {
  return vi.fn(async (url: string) =>
    url.includes('geocoding') ? jsonResponse(geoFixture) : jsonResponse(forecastFixture),
  );
}

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/weather', () => {
  beforeEach(() => __clearCaches());
  afterEach(() => vi.unstubAllGlobals());

  it('returns normalized weather for a city', async () => {
    vi.stubGlobal('fetch', routedFetch());
    const res = await request(app).get('/api/weather?city=Kolkata');
    expect(res.status).toBe(200);
    expect(res.body.location.name).toBe('Kolkata');
    expect(res.body.current).toBeDefined();
    expect(res.body.hourly).toHaveLength(24);
    expect(res.body.daily).toHaveLength(7);
    // The raw provider field names must NOT leak through.
    expect(res.body.current.weather_code).toBeUndefined();
    expect(res.body.current.temperature_2m).toBeUndefined();
  });

  it('returns weather for coordinates', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(forecastFixture)));
    const res = await request(app).get('/api/weather?lat=22.57&lon=88.36');
    expect(res.status).toBe(200);
    expect(res.body.location.timezone).toBe('Asia/Kolkata');
  });

  it('400 when no query parameters are provided', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400 for an out-of-range latitude', async () => {
    const res = await request(app).get('/api/weather?lat=200&lon=88');
    expect(res.status).toBe(400);
  });

  it('400 when only lat is provided (lon missing)', async () => {
    const res = await request(app).get('/api/weather?lat=22.5');
    expect(res.status).toBe(400);
  });

  it('404 with LOCATION_NOT_FOUND for an unknown city', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(emptyGeoFixture)));
    const res = await request(app).get('/api/weather?city=zzzznotacity');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('LOCATION_NOT_FOUND');
  });

  it('503 (sanitized) when the upstream network fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const res = await request(app).get('/api/weather?lat=1&lon=1');
    expect(res.status).toBe(503);
    expect(res.body.error.message).toMatch(/unavailable|reach/i);
    // No stack traces or raw errors leaked.
    expect(JSON.stringify(res.body)).not.toMatch(/network down/);
  });

  it('429 when the upstream is rate limited', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 429)));
    const res = await request(app).get('/api/weather?lat=2&lon=2');
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
  });
});

describe('GET /api/weather/current and /forecast', () => {
  beforeEach(() => __clearCaches());
  afterEach(() => vi.unstubAllGlobals());

  it('current returns only the current block', async () => {
    vi.stubGlobal('fetch', routedFetch());
    const res = await request(app).get('/api/weather/current?city=Kolkata');
    expect(res.status).toBe(200);
    expect(res.body.current).toBeDefined();
    expect(res.body.hourly).toBeUndefined();
    expect(res.body.daily).toBeUndefined();
  });

  it('forecast returns hourly + daily but not current', async () => {
    vi.stubGlobal('fetch', routedFetch());
    const res = await request(app).get('/api/weather/forecast?city=Kolkata');
    expect(res.status).toBe(200);
    expect(res.body.hourly).toHaveLength(24);
    expect(res.body.daily).toHaveLength(7);
    expect(res.body.current).toBeUndefined();
  });
});

describe('unknown routes', () => {
  it('return a sanitized 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
