import { useCallback, useState } from 'react';
import { STORAGE_KEYS, readString, writeString } from '../lib/storage';
import type { UnitSystem } from '../types/weather';

function initialUnits(): UnitSystem {
  const stored = readString(STORAGE_KEYS.units);
  return stored === 'imperial' ? 'imperial' : 'metric';
}

/**
 * Temperature/wind unit system. Persisted to localStorage. Changing units only
 * affects display — it never triggers a re-fetch, because the app keeps the raw
 * metric values from the API and converts at render time.
 */
export function useUnits() {
  const [system, setSystemState] = useState<UnitSystem>(initialUnits);

  const setSystem = useCallback((next: UnitSystem) => {
    writeString(STORAGE_KEYS.units, next);
    setSystemState(next);
  }, []);

  const toggle = useCallback(() => {
    setSystemState((prev) => {
      const next: UnitSystem = prev === 'metric' ? 'imperial' : 'metric';
      writeString(STORAGE_KEYS.units, next);
      return next;
    });
  }, []);

  return { system, isMetric: system === 'metric', setSystem, toggle };
}
