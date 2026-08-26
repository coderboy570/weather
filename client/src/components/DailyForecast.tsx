import { Droplet } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';
import { dayLabel, formatTemp } from '../lib/format';
import { useNow } from '../hooks/useNow';
import type { UnitSystem, WeatherResponse } from '../types/weather';

interface DailyForecastProps {
  data: WeatherResponse;
  system: UnitSystem;
}

export function DailyForecast({ data, system }: DailyForecastProps) {
  const now = useNow(60_000);
  const days = data.daily;
  if (days.length === 0) return null;

  // Range across the whole week, so each row's bar is comparable.
  const weekMin = Math.min(...days.map((d) => d.tempMin));
  const weekMax = Math.max(...days.map((d) => d.tempMax));
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <section className="glass animate-fade-up p-5 sm:p-6" aria-label="7-day forecast" style={{ animationDelay: '180ms' }}>
      <h2 className="mb-3 font-display text-lg font-semibold text-slate-900 dark:text-white">7-day forecast</h2>
      <ul className="divide-y divide-black/5 dark:divide-white/5">
        {days.map((day) => {
          const leftPct = ((day.tempMin - weekMin) / span) * 100;
          const widthPct = Math.max(((day.tempMax - day.tempMin) / span) * 100, 8);
          const label = dayLabel(day.date, data.location.utcOffsetSeconds, now);
          const prob = day.precipitationProbabilityMax;

          return (
            <li
              key={day.date}
              className="grid grid-cols-[3.5rem_2.5rem_1.75rem_1fr] items-center gap-3 py-3 sm:gap-4"
              aria-label={`${label}: ${day.condition.label}, high ${formatTemp(day.tempMax, system)}, low ${formatTemp(day.tempMin, system)}`}
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>

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

              <WeatherIcon
                icon={day.condition.icon}
                isDay
                label={day.condition.label}
                className="h-6 w-6 text-sky-500 dark:text-sky-300"
                strokeWidth={1.75}
              />

              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="tnum w-9 text-right text-sm text-slate-400 dark:text-slate-500">
                  {formatTemp(day.tempMin, system)}
                </span>
                <div className="relative h-1.5 flex-1 rounded-full bg-slate-200/80 dark:bg-white/10">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  />
                </div>
                <span className="tnum w-9 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatTemp(day.tempMax, system)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
