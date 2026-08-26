import type { ComponentType } from 'react';
import {
  Cloud,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Sun,
  Thermometer,
  Umbrella,
  Wind,
  type LucideProps,
} from 'lucide-react';
import {
  formatClock,
  formatPercent,
  formatPrecip,
  formatPressure,
  formatTempWithUnit,
  formatUv,
  formatVisibility,
  formatWind,
  formatWindDirection,
  uvCategory,
} from '../lib/format';
import type { UnitSystem, WeatherResponse } from '../types/weather';

interface DetailsGridProps {
  data: WeatherResponse;
  system: UnitSystem;
}

interface Tile {
  key: string;
  icon: ComponentType<LucideProps>;
  label: string;
  value: string;
  sub?: string;
}

export function WeatherDetailsGrid({ data, system }: DetailsGridProps) {
  const { current, daily } = data;
  const today = daily[0];
  const uv = uvCategory(current.uvIndex);

  const tiles: Tile[] = [
    { key: 'humidity', icon: Droplets, label: 'Humidity', value: formatPercent(current.humidity) },
    {
      key: 'wind',
      icon: Wind,
      label: 'Wind',
      value: formatWind(current.windSpeed, system),
      sub: formatWindDirection(current.windDirection),
    },
    { key: 'gust', icon: Wind, label: 'Wind gusts', value: formatWind(current.windGust, system) },
    { key: 'pressure', icon: Gauge, label: 'Pressure', value: formatPressure(current.pressure) },
    { key: 'visibility', icon: Eye, label: 'Visibility', value: formatVisibility(current.visibility, system) },
    {
      key: 'uv',
      icon: Sun,
      label: 'UV index',
      value: formatUv(current.uvIndex),
      sub: uv.label,
    },
    { key: 'dew', icon: Thermometer, label: 'Dew point', value: formatTempWithUnit(current.dewPoint, system) },
    { key: 'cloud', icon: Cloud, label: 'Cloud cover', value: formatPercent(current.cloudCover) },
    { key: 'precip', icon: Umbrella, label: 'Precipitation', value: formatPrecip(current.precipitation) },
  ];

  if (today) {
    tiles.push(
      { key: 'sunrise', icon: Sunrise, label: 'Sunrise', value: formatClock(today.sunrise) },
      { key: 'sunset', icon: Sunset, label: 'Sunset', value: formatClock(today.sunset) },
    );
  }

  return (
    <section className="animate-fade-up" aria-label="Weather details" style={{ animationDelay: '60ms' }}>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map(({ key, icon: Icon, label, value, sub }) => (
          <div key={key} className="glass-soft p-4">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
              <dt className="text-xs font-semibold uppercase tracking-wide">{label}</dt>
            </div>
            <dd className="tnum mt-2 text-xl font-semibold text-slate-900 dark:text-white">{value}</dd>
            {sub && <dd className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
