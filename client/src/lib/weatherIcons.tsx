/**
 * Maps our semantic weather-icon keys to lucide-react icon components, with
 * day/night variants where it matters. Using a real icon library (not emoji)
 * keeps the visual language crisp and consistent across platforms.
 */
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Moon,
  Sun,
  CloudOff,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherIconKey } from '../types/weather';

export function weatherIconComponent(icon: WeatherIconKey, isDay: boolean): LucideIcon {
  switch (icon) {
    case 'clear':
      return isDay ? Sun : Moon;
    case 'partly-cloudy':
      return isDay ? CloudSun : CloudMoon;
    case 'cloudy':
      return Cloud;
    case 'fog':
      return CloudFog;
    case 'drizzle':
      return CloudDrizzle;
    case 'rain':
      return CloudRain;
    case 'freezing-rain':
      return CloudRainWind;
    case 'rain-showers':
      return isDay ? CloudSunRain : CloudMoonRain;
    case 'snow':
    case 'snow-showers':
      return CloudSnow;
    case 'thunderstorm':
    case 'thunderstorm-hail':
      return CloudLightning;
    case 'unknown':
    default:
      return CloudOff;
  }
}
