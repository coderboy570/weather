import type { LucideProps } from 'lucide-react';
import { weatherIconComponent } from '../lib/weatherIcons';
import type { WeatherIconKey } from '../types/weather';

interface WeatherIconProps extends Omit<LucideProps, 'ref'> {
  icon: WeatherIconKey;
  isDay: boolean;
  /** When provided, the icon is exposed to assistive tech with this label. */
  label?: string;
}

/**
 * Renders the correct lucide icon for a weather condition. Decorative by
 * default; pass `label` to expose it as an accessible image.
 */
export function WeatherIcon({ icon, isDay, label, ...rest }: WeatherIconProps) {
  const Icon = weatherIconComponent(icon, isDay);
  return (
    <Icon
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    />
  );
}
