import { useCallback, useEffect, useState } from 'react';
import { ApiError, getWeatherByCity, getWeatherByCoords } from '../services/weatherApi';
import type { WeatherResponse } from '../types/weather';

export type WeatherTarget =
  | { kind: 'coords'; lat: number; lon: number }
  | { kind: 'city'; city: string };

function targetKey(target: WeatherTarget | null): string {
  if (!target) return '';
  return target.kind === 'coords' ? `c:${target.lat},${target.lon}` : `q:${target.city.toLowerCase()}`;
}

/**
 * Fetches weather for a target (coordinates or a city name), managing loading
 * and error state. Stale requests are aborted so only the latest target wins.
 * Previous data is retained across target changes so a refresh doesn't blank
 * the screen; callers decide whether to show a skeleton (loading && !data).
 */
export function useWeather(target: WeatherTarget | null) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);

  const key = targetKey(target);

  useEffect(() => {
    if (!target) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const promise =
      target.kind === 'coords'
        ? getWeatherByCoords(target.lat, target.lon, controller.signal)
        : getWeatherByCity(target.city, controller.signal);

    promise
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // superseded — ignore
        setLoading(false);
        setError(
          err instanceof ApiError
            ? err
            : new ApiError('UNKNOWN', 'Something went wrong while loading the weather.', 0),
        );
      });

    return () => controller.abort();
    // `key` captures the target identity; `nonce` forces a manual refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch };
}
