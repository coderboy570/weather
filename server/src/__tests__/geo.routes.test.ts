import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { __clearCaches } from '../services/weatherService';
import { geoFixture, emptyGeoFixture, jsonResponse } from './fixtures/openMeteo.fixture';

const app = createApp();

describe('GET /api/geo/search', () => {
  beforeEach(() => __clearCaches());
  afterEach(() => vi.unstubAllGlobals());

  it('returns location suggestions', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(geoFixture)));
    const res = await request(app).get('/api/geo/search?q=Kolkata');
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0]).toMatchObject({ name: 'Kolkata', countryCode: 'IN' });
  });

  it('returns an empty array (not an error) for no matches', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(emptyGeoFixture)));
    const res = await request(app).get('/api/geo/search?q=zzzznotacity');
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  it('400 when q is missing', async () => {
    const res = await request(app).get('/api/geo/search');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400 when count is out of range', async () => {
    const res = await request(app).get('/api/geo/search?q=London&count=999');
    expect(res.status).toBe(400);
  });
});
