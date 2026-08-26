/**
 * Client-side API layer. The browser only ever talks to OUR backend — never to
 * the weather provider directly — so no provider key is ever shipped to the
 * client. In dev, requests to /api are proxied to the Express server
 * (see vite.config.ts); in prod, set VITE_API_BASE_URL to the backend origin.
 */
import type { ApiErrorBody, LocationSuggestion, WeatherResponse } from '../types/weather';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 12_000;

/** A typed error the UI can branch on (e.g. show a "not found" hint). */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const FRIENDLY: Record<string, string> = {
  NETWORK: "Can't reach the weather service. Check your connection and try again.",
  TIMEOUT: 'The weather service took too long to respond. Please try again.',
  UNKNOWN: 'Something went wrong while loading the weather. Please try again.',
};

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
    REQUEST_TIMEOUT_MS,
  );

  // Forward an external cancellation (e.g. a superseded search) to our fetch.
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      let body: Partial<ApiErrorBody> | null = null;
      try {
        body = (await res.json()) as ApiErrorBody;
      } catch {
        /* non-JSON error body */
      }
      const code = body?.error?.code ?? 'HTTP_ERROR';
      const message = body?.error?.message ?? FRIENDLY.UNKNOWN;
      throw new ApiError(code, message, res.status);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    // A cancellation triggered by the caller — let the caller decide to ignore.
    if (err instanceof DOMException && err.name === 'AbortError' && signal?.aborted) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new ApiError('TIMEOUT', FRIENDLY.TIMEOUT, 0);
    }
    // Network failure / DNS / CORS etc.
    throw new ApiError('NETWORK', FRIENDLY.NETWORK, 0);
  } finally {
    clearTimeout(timeout);
  }
}

export function getWeatherByCity(city: string, signal?: AbortSignal): Promise<WeatherResponse> {
  return request<WeatherResponse>(`/api/weather?city=${encodeURIComponent(city)}`, signal);
}

export function getWeatherByCoords(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherResponse> {
  return request<WeatherResponse>(`/api/weather?lat=${lat}&lon=${lon}`, signal);
}

export async function searchLocations(
  query: string,
  count = 6,
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const data = await request<{ results: LocationSuggestion[] }>(
    `/api/geo/search?q=${encodeURIComponent(query)}&count=${count}`,
    signal,
  );
  return data.results ?? [];
}
