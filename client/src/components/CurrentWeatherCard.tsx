import { Star } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { WeatherIcon } from './WeatherIcon';
import { cn } from '../lib/cn';
import {
  countryCodeToFlag,
  formatClock,
  formatFullDate,
  formatLocationClock,
  formatTemp,
  formatTempWithUnit,
} from '../lib/format';
import type { UnitSystem, WeatherResponse } from '../types/weather';

interface CurrentWeatherCardProps {
  data: WeatherResponse;
  system: UnitSystem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function CurrentWeatherCard({ data, system, isFavorite, onToggleFavorite }: CurrentWeatherCardProps) {
  const now = useNow();
  const { location, current, daily } = data;
  const today = daily[0];
  const flag = countryCodeToFlag(location.countryCode);
  const placeParts = [location.admin1, location.country].filter(Boolean).join(', ');

  return (
    <section className="glass animate-fade-up p-6 sm:p-8" aria-label="Current weather">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            <span className="truncate">{location.name}</span>
            {flag && (
              <span className="text-xl" aria-hidden="true">
                {flag}
              </span>
            )}
          </h1>
          {placeParts && <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{placeParts}</p>}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="tnum font-medium text-slate-700 dark:text-slate-300">
              {formatLocationClock(location.utcOffsetSeconds, now)}
            </span>{' '}
            · {formatFullDate(current.time)}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="icon-button shrink-0"
        >
          <Star
            className={cn('h-5 w-5', isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500 dark:text-slate-300')}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-start">
            <span className="tnum font-display text-7xl font-semibold leading-none text-slate-900 dark:text-white sm:text-8xl">
              {formatTemp(current.temperature, system)}
            </span>
          </div>
          <p className="mt-3 text-lg font-medium text-slate-700 dark:text-slate-200">{current.condition.label}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Feels like {formatTempWithUnit(current.apparentTemperature, system)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <WeatherIcon
            icon={current.condition.icon}
            isDay={current.condition.isDay}
            label={current.condition.label}
            className="h-24 w-24 text-sky-500 drop-shadow-sm dark:text-sky-300 sm:h-28 sm:w-28"
            strokeWidth={1.5}
          />
          {today && (
            <p className="tnum text-sm text-slate-500 dark:text-slate-400">
              <span aria-label="High">H: {formatTemp(today.tempMax, system)}</span>{' '}
              <span aria-label="Low">L: {formatTemp(today.tempMin, system)}</span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
        Updated {formatClock(current.time)} local time
      </p>
    </section>
  );
}
