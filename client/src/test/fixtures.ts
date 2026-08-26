/**
 * Shared test fixtures. These are MOCK values used only by the test suite — they
 * never reach the running application, which always renders real API data.
 */
import type {
  DailyEntry,
  HourlyEntry,
  LocationSuggestion,
  SavedPlace,
  WeatherCondition,
  WeatherResponse,
} from '../types/weather';

const partlyCloudy: WeatherCondition = {
  code: 2,
  label: 'Partly cloudy',
  icon: 'partly-cloudy',
  isDay: true,
};

const clearNight: WeatherCondition = {
  code: 0,
  label: 'Clear sky',
  icon: 'clear',
  isDay: false,
};

function hour(time: string, temperature: number, prob: number | null): HourlyEntry {
  return {
    time,
    temperature,
    apparentTemperature: temperature + 2,
    humidity: 70,
    precipitationProbability: prob,
    precipitation: 0,
    uvIndex: 5,
    windSpeed: 12,
    windDirection: 200,
    condition: partlyCloudy,
  };
}

function day(date: string, tempMin: number, tempMax: number, prob: number | null): DailyEntry {
  return {
    date,
    tempMax,
    tempMin,
    apparentMax: tempMax + 2,
    apparentMin: tempMin - 1,
    sunrise: `${date}T05:24`,
    sunset: `${date}T18:12`,
    uvIndexMax: 8,
    precipitationSum: 1.2,
    precipitationProbabilityMax: prob,
    windSpeedMax: 20,
    windDirectionDominant: 210,
    condition: partlyCloudy,
  };
}

/** Kolkata (UTC+5:30) with rich, realistic values. */
export function makeWeatherResponse(overrides: Partial<WeatherResponse> = {}): WeatherResponse {
  return {
    location: {
      name: 'Kolkata',
      country: 'India',
      countryCode: 'IN',
      admin1: 'West Bengal',
      latitude: 22.5626,
      longitude: 88.363,
      timezone: 'Asia/Kolkata',
      utcOffsetSeconds: 19800,
    },
    current: {
      time: '2026-08-25T13:00',
      temperature: 30.4,
      apparentTemperature: 36.1,
      humidity: 74,
      dewPoint: 25.1,
      precipitation: 0.3,
      pressure: 1004,
      surfacePressure: 1001,
      windSpeed: 14.6,
      windDirection: 205,
      windGust: 28.1,
      visibility: 12000,
      cloudCover: 62,
      uvIndex: 8,
      condition: partlyCloudy,
    },
    hourly: [
      hour('2026-08-25T13:00', 30.4, 0),
      hour('2026-08-25T14:00', 31.1, 20),
      hour('2026-08-25T15:00', 30.8, 45),
      hour('2026-08-25T16:00', 29.9, 60),
    ],
    daily: [
      day('2026-08-25', 27.2, 32.6, 55),
      day('2026-08-26', 26.8, 31.9, 40),
      day('2026-08-27', 27.0, 33.1, 10),
    ],
    units: {
      temperature: '°C',
      windSpeed: 'km/h',
      pressure: 'hPa',
      precipitation: 'mm',
      visibility: 'm',
    },
    fetchedAt: '2026-08-25T07:30:00.000Z',
    ...overrides,
  };
}

export { clearNight };

export function makeSuggestion(overrides: Partial<LocationSuggestion> = {}): LocationSuggestion {
  return {
    id: 1275004,
    name: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    latitude: 22.5626,
    longitude: 88.363,
    timezone: 'Asia/Kolkata',
    population: 4631392,
    ...overrides,
  };
}

export function makePlace(overrides: Partial<SavedPlace> = {}): SavedPlace {
  return {
    id: 1275004,
    name: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    latitude: 22.5626,
    longitude: 88.363,
    ...overrides,
  };
}
