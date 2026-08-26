import { describe, expect, it } from 'vitest';
import { hasPrecipitation, hasSunGlow, sceneGradient, weatherCategory } from './scenes';
import type { WeatherIconKey } from '../types/weather';

describe('weatherCategory', () => {
  const cases: [WeatherIconKey, string][] = [
    ['clear', 'clear'],
    ['partly-cloudy', 'clouds'],
    ['cloudy', 'clouds'],
    ['unknown', 'clouds'],
    ['fog', 'fog'],
    ['drizzle', 'rain'],
    ['rain', 'rain'],
    ['rain-showers', 'rain'],
    ['freezing-rain', 'rain'],
    ['snow', 'snow'],
    ['snow-showers', 'snow'],
    ['thunderstorm', 'storm'],
    ['thunderstorm-hail', 'storm'],
  ];

  it.each(cases)('maps %s to %s', (icon, category) => {
    expect(weatherCategory(icon)).toBe(category);
  });
});

describe('sceneGradient', () => {
  it('produces a 3-stop linear gradient', () => {
    const g = sceneGradient('clear', true, false);
    expect(g).toMatch(/^linear-gradient\(160deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 48%, #[0-9a-f]{6} 100%\)$/);
  });

  it('differs between light and dark themes', () => {
    expect(sceneGradient('clear', true, false)).not.toBe(sceneGradient('clear', true, true));
  });

  it('differs between clear day and clear night', () => {
    expect(sceneGradient('clear', true, false)).not.toBe(sceneGradient('clear', false, false));
  });

  it('uses the same scene for all cloudy-family icons', () => {
    expect(sceneGradient('cloudy', true, false)).toBe(sceneGradient('partly-cloudy', true, false));
  });
});

describe('scene accents', () => {
  it('shows a sun glow only for clear daytime', () => {
    expect(hasSunGlow('clear', true)).toBe(true);
    expect(hasSunGlow('clear', false)).toBe(false);
    expect(hasSunGlow('rain', true)).toBe(false);
  });

  it('flags precipitation scenes', () => {
    expect(hasPrecipitation('rain')).toBe(true);
    expect(hasPrecipitation('snow')).toBe(true);
    expect(hasPrecipitation('thunderstorm')).toBe(true);
    expect(hasPrecipitation('clear')).toBe(false);
    expect(hasPrecipitation('cloudy')).toBe(false);
  });
});
