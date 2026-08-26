import { describe, expect, it } from 'vitest';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudOff,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Moon,
  Sun,
} from 'lucide-react';
import { weatherIconComponent } from './weatherIcons';

describe('weatherIconComponent', () => {
  it('uses day/night variants for clear skies', () => {
    expect(weatherIconComponent('clear', true)).toBe(Sun);
    expect(weatherIconComponent('clear', false)).toBe(Moon);
  });

  it('uses day/night variants for partly cloudy and rain showers', () => {
    expect(weatherIconComponent('partly-cloudy', true)).toBe(CloudSun);
    expect(weatherIconComponent('partly-cloudy', false)).toBe(CloudMoon);
    expect(weatherIconComponent('rain-showers', true)).toBe(CloudSunRain);
    expect(weatherIconComponent('rain-showers', false)).toBe(CloudMoonRain);
  });

  it('maps the remaining conditions to a stable icon', () => {
    expect(weatherIconComponent('cloudy', true)).toBe(Cloud);
    expect(weatherIconComponent('fog', true)).toBe(CloudFog);
    expect(weatherIconComponent('drizzle', true)).toBe(CloudDrizzle);
    expect(weatherIconComponent('rain', true)).toBe(CloudRain);
    expect(weatherIconComponent('freezing-rain', true)).toBe(CloudRainWind);
    expect(weatherIconComponent('snow', true)).toBe(CloudSnow);
    expect(weatherIconComponent('snow-showers', true)).toBe(CloudSnow);
    expect(weatherIconComponent('thunderstorm', true)).toBe(CloudLightning);
    expect(weatherIconComponent('thunderstorm-hail', true)).toBe(CloudLightning);
    expect(weatherIconComponent('unknown', true)).toBe(CloudOff);
  });
});
