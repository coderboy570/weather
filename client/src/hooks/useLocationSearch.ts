import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import { ApiError, searchLocations } from '../services/weatherApi';
import type { LocationSuggestion } from '../types/weather';

const MIN_QUERY_LENGTH = 2;

/**
 * Debounced, cancellable location autocomplete. Queries shorter than two
 * characters are ignored, each keystroke supersedes the previous request, and
 * in-flight requests are aborted on change/unmount to avoid race conditions.
 */
export function useLocationSearch(query: string) {
  const debounced = useDebounce(query.trim(), 300);
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchLocations(debounced, 6, controller.signal)
      .then((res) => {
        setResults(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // superseded — ignore
        setResults([]);
        setLoading(false);
        setError(err instanceof ApiError ? err.message : 'Search is unavailable right now.');
      });

    return () => controller.abort();
  }, [debounced]);

  return {
    results,
    loading,
    error,
    hasQuery: debounced.length >= MIN_QUERY_LENGTH,
  };
}
