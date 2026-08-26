/**
 * Pure mapping from a weather condition to a subtle background "scene".
 *
 * Design intent: the UI theme (light/dark) always governs text + surface
 * contrast, so the page stays readable. The weather only *tints* the
 * theme-appropriate background, with a gentle day/night nuance for clear skies.
 * This keeps the atmosphere expressive without ever fighting legibility.
 */
import type { WeatherIconKey } from '../types/weather';

export type WeatherCategory = 'clear' | 'clouds' | 'fog' | 'rain' | 'snow' | 'storm';

export function weatherCategory(icon: WeatherIconKey): WeatherCategory {
  switch (icon) {
    case 'clear':
      return 'clear';
    case 'partly-cloudy':
    case 'cloudy':
    case 'unknown':
      return 'clouds';
    case 'fog':
      return 'fog';
    case 'drizzle':
    case 'rain':
    case 'rain-showers':
    case 'freezing-rain':
      return 'rain';
    case 'snow':
    case 'snow-showers':
      return 'snow';
    case 'thunderstorm':
    case 'thunderstorm-hail':
      return 'storm';
    default:
      return 'clouds';
  }
}

type SceneKey = 'clearDay' | 'clearNight' | 'clouds' | 'fog' | 'rain' | 'snow' | 'storm';

type Stops = [string, string, string];

const SCENES: Record<SceneKey, { light: Stops; dark: Stops }> = {
  clearDay: {
    light: ['#cfe8ff', '#eaf4ff', '#fff4e2'],
    dark: ['#0c1a33', '#12213f', '#1b2547'],
  },
  clearNight: {
    light: ['#dfe7ff', '#eef1ff', '#f6f0ff'],
    dark: ['#0a1120', '#0f1830', '#171e3a'],
  },
  clouds: {
    light: ['#dde6ee', '#eef2f6', '#f5f7f9'],
    dark: ['#111722', '#171e2b', '#1c2431'],
  },
  fog: {
    light: ['#e6e8ea', '#eef0f2', '#f4f5f6'],
    dark: ['#14181e', '#191d24', '#1e2229'],
  },
  rain: {
    light: ['#d5dfea', '#e3ebf2', '#eef3f7'],
    dark: ['#0d1622', '#121d2c', '#172433'],
  },
  snow: {
    light: ['#e4ecf5', '#f0f5fa', '#f8fbff'],
    dark: ['#121a26', '#18212f', '#1e2836'],
  },
  storm: {
    light: ['#d2d8e4', '#dee4ee', '#e9edf4'],
    dark: ['#0c1018', '#121620', '#181d28'],
  },
};

function sceneKey(category: WeatherCategory, isDay: boolean): SceneKey {
  if (category === 'clear') return isDay ? 'clearDay' : 'clearNight';
  return category;
}

/** CSS linear-gradient string for the given condition + theme. */
export function sceneGradient(icon: WeatherIconKey, isDay: boolean, isDark: boolean): string {
  const scene = SCENES[sceneKey(weatherCategory(icon), isDay)];
  const [a, b, c] = isDark ? scene.dark : scene.light;
  return `linear-gradient(160deg, ${a} 0%, ${b} 48%, ${c} 100%)`;
}

/** Whether a soft "sun glow" accent should be shown (clear daytime only). */
export function hasSunGlow(icon: WeatherIconKey, isDay: boolean): boolean {
  return weatherCategory(icon) === 'clear' && isDay;
}

/** Whether animated precipitation streaks suit the scene. */
export function hasPrecipitation(icon: WeatherIconKey): boolean {
  const c = weatherCategory(icon);
  return c === 'rain' || c === 'storm' || c === 'snow';
}
