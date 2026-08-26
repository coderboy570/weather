/**
 * Maps WMO weather interpretation codes (used by Open-Meteo) to a human label
 * and a semantic icon key. The frontend maps the icon key -> an actual icon
 * component (and chooses a day/night variant). Reference: WMO code table 4677.
 */
export type WeatherIconKey =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'rain-showers'
  | 'snow-showers'
  | 'thunderstorm'
  | 'thunderstorm-hail'
  | 'unknown';

export interface WeatherCodeInfo {
  label: string;
  icon: WeatherIconKey;
}

const WMO_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', icon: 'clear' },
  1: { label: 'Mainly clear', icon: 'partly-cloudy' },
  2: { label: 'Partly cloudy', icon: 'partly-cloudy' },
  3: { label: 'Overcast', icon: 'cloudy' },
  45: { label: 'Fog', icon: 'fog' },
  48: { label: 'Depositing rime fog', icon: 'fog' },
  51: { label: 'Light drizzle', icon: 'drizzle' },
  53: { label: 'Moderate drizzle', icon: 'drizzle' },
  55: { label: 'Dense drizzle', icon: 'drizzle' },
  56: { label: 'Light freezing drizzle', icon: 'freezing-rain' },
  57: { label: 'Dense freezing drizzle', icon: 'freezing-rain' },
  61: { label: 'Slight rain', icon: 'rain' },
  63: { label: 'Moderate rain', icon: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain' },
  66: { label: 'Light freezing rain', icon: 'freezing-rain' },
  67: { label: 'Heavy freezing rain', icon: 'freezing-rain' },
  71: { label: 'Slight snowfall', icon: 'snow' },
  73: { label: 'Moderate snowfall', icon: 'snow' },
  75: { label: 'Heavy snowfall', icon: 'snow' },
  77: { label: 'Snow grains', icon: 'snow' },
  80: { label: 'Slight rain showers', icon: 'rain-showers' },
  81: { label: 'Moderate rain showers', icon: 'rain-showers' },
  82: { label: 'Violent rain showers', icon: 'rain-showers' },
  85: { label: 'Slight snow showers', icon: 'snow-showers' },
  86: { label: 'Heavy snow showers', icon: 'snow-showers' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with slight hail', icon: 'thunderstorm-hail' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'thunderstorm-hail' },
};

export function describeWeatherCode(code: number): WeatherCodeInfo {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: 'unknown' };
}
