import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplet } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';
import { formatHour, formatTemp } from '../lib/format';
import type { UnitSystem, WeatherResponse } from '../types/weather';

interface HourlyForecastProps {
  data: WeatherResponse;
  system: UnitSystem;
}

export function HourlyForecast({ data, system }: HourlyForecastProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const hours = data.hourly;
  if (hours.length === 0) return null;

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="glass animate-fade-up p-5 sm:p-6" aria-label="Hourly forecast" style={{ animationDelay: '120ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Next 24 hours</h2>
        <div className="hidden gap-1 sm:flex">
          <button type="button" onClick={() => scrollBy(-260)} className="icon-button h-9 w-9" aria-label="Scroll hourly forecast left">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scrollBy(260)} className="icon-button h-9 w-9" aria-label="Scroll hourly forecast right">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={scrollerRef}
        className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth pb-1"
        aria-label="Hour-by-hour conditions"
      >
        {hours.map((hour, index) => {
          const prob = hour.precipitationProbability;
          return (
            <li
              key={hour.time}
              className="flex min-w-[68px] flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center"
            >
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {index === 0 ? 'Now' : formatHour(hour.time)}
              </span>
              <WeatherIcon
                icon={hour.condition.icon}
                isDay={hour.condition.isDay}
                label={hour.condition.label}
                className="h-7 w-7 text-sky-500 dark:text-sky-300"
                strokeWidth={1.75}
              />
              <span className="tnum text-sm font-semibold text-slate-900 dark:text-white">
                {formatTemp(hour.temperature, system)}
              </span>
              <span
                className={
                  'flex items-center gap-0.5 text-xs text-sky-600 dark:text-sky-300 ' +
                  (prob != null && prob > 0 ? '' : 'invisible')
                }
                aria-hidden={prob != null && prob > 0 ? undefined : true}
              >
                <Droplet className="h-3 w-3" aria-hidden="true" />
                {prob ?? 0}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
