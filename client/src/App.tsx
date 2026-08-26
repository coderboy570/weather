import { useEffect, useRef, useState } from 'react';
import { CloudSun, RefreshCw } from 'lucide-react';

import { AppBackground } from './components/AppBackground';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { UnitToggle } from './components/UnitToggle';
import { UseMyLocationButton } from './components/UseMyLocationButton';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherDetailsGrid } from './components/WeatherDetailsGrid';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { FavoritesBar } from './components/FavoritesBar';
import { RecentSearches } from './components/RecentSearches';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';

import { useTheme } from './hooks/useTheme';
import { useUnits } from './hooks/useUnits';
import { useFavorites } from './hooks/useFavorites';
import { useRecentSearches } from './hooks/useRecentSearches';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather, type WeatherTarget } from './hooks/useWeather';

import { STORAGE_KEYS, readJSON, writeJSON } from './lib/storage';
import { locationToPlace, placeKey } from './lib/places';
import type { SavedPlace } from './types/weather';

const geoSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

/** Restore the last viewed place so the app opens where the user left off. */
function initialState(): { target: WeatherTarget | null; place: SavedPlace | null } {
  const last = readJSON<SavedPlace | null>(STORAGE_KEYS.lastPlace, null);
  if (last && Number.isFinite(last.latitude) && Number.isFinite(last.longitude)) {
    return { target: { kind: 'coords', lat: last.latitude, lon: last.longitude }, place: last };
  }
  return { target: null, place: null };
}

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { system, setSystem } = useUnits();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const { recents, addRecent, clearRecents } = useRecentSearches();
  const { status: geoStatus, error: geoError, locate } = useGeolocation();

  const [{ target, place: initialPlace }] = useState(initialState);
  const [weatherTarget, setWeatherTarget] = useState<WeatherTarget | null>(target);
  const [pendingPlace, setPendingPlace] = useState<SavedPlace | null>(initialPlace);

  const { data, loading, error, refetch } = useWeather(weatherTarget);

  // Keep the latest selected place available to the data effect without making
  // that effect re-run when the selection changes (only when data changes).
  const pendingPlaceRef = useRef(pendingPlace);
  useEffect(() => {
    pendingPlaceRef.current = pendingPlace;
  }, [pendingPlace]);

  // When weather resolves, record it as a recent search and remember it as the
  // last viewed place. Derive a place from the response when we don't already
  // have one (e.g. a city-name search or a geolocation lookup).
  useEffect(() => {
    if (!data) return;
    const resolved = pendingPlaceRef.current ?? locationToPlace(data.location);
    addRecent(resolved);
    writeJSON(STORAGE_KEYS.lastPlace, resolved);
  }, [data, addRecent]);

  function selectPlace(next: SavedPlace) {
    setPendingPlace(next);
    setWeatherTarget({ kind: 'coords', lat: next.latitude, lon: next.longitude });
  }

  function submitCity(city: string) {
    setPendingPlace(null);
    setWeatherTarget({ kind: 'city', city });
  }

  async function handleUseLocation() {
    try {
      const coords = await locate();
      setPendingPlace(null);
      setWeatherTarget({ kind: 'coords', lat: coords.lat, lon: coords.lon });
    } catch {
      /* message is surfaced via geoError */
    }
  }

  // The place currently on screen — used for favorite state + list highlighting.
  const activePlace = pendingPlace ?? (data ? locationToPlace(data.location) : null);
  const activeKey = activePlace ? placeKey(activePlace) : undefined;

  const showEmpty = !weatherTarget && !data;
  const showSkeleton = loading && !data;
  const showError = !!error && !data;

  return (
    <div className="min-h-screen">
      <AppBackground icon={data?.current.condition.icon} isDay={data?.current.condition.isDay ?? true} isDark={isDark} />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-sm">
              <CloudSun className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Skyline
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UnitToggle system={system} onChange={setSystem} />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchBar onSelectPlace={selectPlace} onSubmitCity={submitCity} recents={recents} />
          </div>
          {geoSupported && (
            <UseMyLocationButton onLocate={handleUseLocation} loading={geoStatus === 'loading'} className="sm:self-stretch" />
          )}
        </div>

        {geoStatus === 'error' && geoError && (
          <p role="alert" className="mt-3 rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-300">
            {geoError}
          </p>
        )}

        {(favorites.length > 0 || recents.length > 0) && (
          <div className="mt-5 space-y-3">
            <FavoritesBar favorites={favorites} activeKey={activeKey} onSelect={selectPlace} onRemove={removeFavorite} />
            <RecentSearches recents={recents} activeKey={activeKey} onSelect={selectPlace} onClear={clearRecents} />
          </div>
        )}

        <main className="mt-6">
          {showEmpty ? (
            <EmptyState onExample={submitCity} onUseLocation={handleUseLocation} geoAvailable={geoSupported} />
          ) : showSkeleton ? (
            <LoadingSkeleton />
          ) : showError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : data ? (
            <div className="space-y-4">
              {error && (
                <p role="alert" className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Couldn&rsquo;t refresh — showing the last available data.
                </p>
              )}
              <CurrentWeatherCard
                data={data}
                system={system}
                isFavorite={!!activePlace && isFavorite(activePlace)}
                onToggleFavorite={() => activePlace && toggleFavorite(activePlace)}
              />
              <WeatherDetailsGrid data={data} system={system} />
              <HourlyForecast data={data} system={system} />
              <DailyForecast data={data} system={system} />
            </div>
          ) : null}
        </main>

        <footer className="mt-10 pb-4 text-center text-xs text-slate-400 dark:text-slate-500">
          Weather data by{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline decoration-dotted underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Open-Meteo
          </a>
          . Times shown in each location&rsquo;s local time zone.
        </footer>
      </div>
    </div>
  );
}
