import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getWeatherByCity, getWeatherByCoords, searchLocations } from './weatherApi';
import { makeWeatherResponse } from '../test/fixtures';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, { ok = true, status = 200 } = {}): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getWeatherByCity', () => {
  it('requests the proxied endpoint and returns parsed data', async () => {
    const data = makeWeatherResponse();
    fetchMock.mockResolvedValue(jsonResponse(data));

    const result = await getWeatherByCity('New York');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/weather?city=New%20York');
    expect(init.headers).toMatchObject({ Accept: 'application/json' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(result.location.name).toBe('Kolkata');
  });
});

describe('getWeatherByCoords', () => {
  it('encodes coordinates into the query', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeWeatherResponse()));
    await getWeatherByCoords(22.5626, 88.363);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/weather?lat=22.5626&lon=88.363');
  });
});

describe('searchLocations', () => {
  it('returns the results array', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ results: [{ id: 1, name: 'Paris' }] }));
    const results = await searchLocations('Par');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/geo/search?q=Par&count=6');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Paris');
  });

  it('tolerates a missing results field', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    expect(await searchLocations('xyz')).toEqual([]);
  });
});

describe('error handling', () => {
  it('maps a structured error body to an ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 'LOCATION_NOT_FOUND', message: 'No matching location.' } }, { ok: false, status: 404 }),
    );

    await expect(getWeatherByCity('zzzz')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'LOCATION_NOT_FOUND',
      message: 'No matching location.',
      status: 404,
    });
  });

  it('falls back to a friendly message for a non-JSON error body', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as Response);

    const err = await getWeatherByCity('x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('HTTP_ERROR');
    expect(err.status).toBe(500);
    expect(err.message).toMatch(/something went wrong/i);
  });

  it('maps a network failure to a NETWORK ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const err = await getWeatherByCity('x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('NETWORK');
  });

  it('maps an internal timeout to a TIMEOUT ApiError', async () => {
    fetchMock.mockRejectedValue(new DOMException('Request timed out', 'TimeoutError'));
    const err = await getWeatherByCity('x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('TIMEOUT');
  });
});
