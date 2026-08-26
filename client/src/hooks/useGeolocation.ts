import { useCallback, useState } from 'react';

export type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

export interface Coords {
  lat: number;
  lon: number;
}

function messageForGeoError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location access was denied. You can still search for a place by name.';
    case err.POSITION_UNAVAILABLE:
      return 'Your location is currently unavailable. Try searching by name instead.';
    case err.TIMEOUT:
      return 'Getting your location took too long. Please try again.';
    default:
      return "Couldn't get your location. Try searching by name instead.";
  }
}

/**
 * Wraps the Geolocation API. `locate()` resolves with coordinates so the caller
 * can immediately fetch weather, and rejects with a friendly message on failure
 * (the message is also exposed via `error` for display).
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((): Promise<Coords> => {
    return new Promise<Coords>((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        const msg = "Your browser doesn't support location access.";
        setStatus('error');
        setError(msg);
        reject(new Error(msg));
        return;
      }

      setStatus('loading');
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setCoords(next);
          setStatus('success');
          resolve(next);
        },
        (err) => {
          const msg = messageForGeoError(err);
          setStatus('error');
          setError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, []);

  return { status, coords, error, locate };
}
