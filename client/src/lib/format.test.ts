import { describe, expect, it } from 'vitest';
import {
  convertTemp,
  convertWind,
  countryCodeToFlag,
  dayLabel,
  degreesToCompass,
  formatClock,
  formatFullDate,
  formatHour,
  formatLocationClock,
  formatMonthDay,
  formatPercent,
  formatPlaceLine,
  formatPlaceShort,
  formatPrecip,
  formatPressure,
  formatTemp,
  formatTempWithUnit,
  formatUpdatedLabel,
  formatVisibility,
  formatWeekday,
  formatWeekdayLong,
  formatWind,
  formatWindDirection,
  locationDateKey,
  locationNow,
  parseLocalIso,
  roundTo,
  tempUnitLabel,
  uvCategory,
  windUnitLabel,
} from './format';

describe('roundTo', () => {
  it('rounds to the requested precision', () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.2355, 2)).toBe(1.24);
    expect(roundTo(9.6)).toBe(10);
    expect(roundTo(-0.4)).toBe(-0);
  });
});

describe('temperature', () => {
  it('converts Celsius to Fahrenheit correctly', () => {
    expect(convertTemp(0, 'imperial')).toBe(32);
    expect(convertTemp(100, 'imperial')).toBe(212);
    expect(convertTemp(37, 'imperial')).toBeCloseTo(98.6, 5);
  });

  it('leaves Celsius untouched in metric', () => {
    expect(convertTemp(21.5, 'metric')).toBe(21.5);
  });

  it('labels units', () => {
    expect(tempUnitLabel('metric')).toBe('°C');
    expect(tempUnitLabel('imperial')).toBe('°F');
  });

  it('formats with a degree sign only', () => {
    expect(formatTemp(30.4, 'metric')).toBe('30°');
    expect(formatTemp(30.4, 'imperial')).toBe('87°'); // 86.72 -> 87
  });

  it('formats with the unit letter', () => {
    expect(formatTempWithUnit(30.4, 'metric')).toBe('30°C');
    expect(formatTempWithUnit(30.4, 'imperial')).toBe('87°F');
  });

  it('shows an em dash for missing values (never a fake number)', () => {
    expect(formatTemp(null, 'metric')).toBe('—');
    expect(formatTemp(undefined, 'metric')).toBe('—');
    expect(formatTemp(NaN, 'metric')).toBe('—');
    expect(formatTempWithUnit(null, 'imperial')).toBe('—');
  });
});

describe('wind', () => {
  it('converts km/h to mph', () => {
    expect(convertWind(100, 'imperial')).toBeCloseTo(62.1371, 3);
    expect(convertWind(100, 'metric')).toBe(100);
  });

  it('labels units', () => {
    expect(windUnitLabel('metric')).toBe('km/h');
    expect(windUnitLabel('imperial')).toBe('mph');
  });

  it('formats rounded values with units', () => {
    expect(formatWind(14.6, 'metric')).toBe('15 km/h');
    expect(formatWind(14.6, 'imperial')).toBe('9 mph'); // 9.07 -> 9
    expect(formatWind(null, 'metric')).toBe('—');
  });
});

describe('visibility', () => {
  it('shows km in metric and miles in imperial', () => {
    expect(formatVisibility(12000, 'metric')).toBe('12 km');
    expect(formatVisibility(12000, 'imperial')).toBe('7.5 mi'); // 7.456 -> 7.5
    expect(formatVisibility(null, 'metric')).toBe('—');
  });
});

describe('pressure / precip / percent', () => {
  it('formats each with the right unit and dash fallback', () => {
    expect(formatPressure(1004)).toBe('1004 hPa');
    expect(formatPressure(null)).toBe('—');
    expect(formatPrecip(0.3)).toBe('0.3 mm');
    expect(formatPrecip(null)).toBe('—');
    expect(formatPercent(74)).toBe('74%');
    expect(formatPercent(null)).toBe('—');
  });
});

describe('wind direction', () => {
  it('maps cardinal bearings to the 16-point compass', () => {
    expect(degreesToCompass(0)).toBe('N');
    expect(degreesToCompass(90)).toBe('E');
    expect(degreesToCompass(180)).toBe('S');
    expect(degreesToCompass(270)).toBe('W');
    expect(degreesToCompass(45)).toBe('NE');
    expect(degreesToCompass(205)).toBe('SSW');
  });

  it('wraps out-of-range and negative bearings', () => {
    expect(degreesToCompass(360)).toBe('N');
    expect(degreesToCompass(-45)).toBe('NW'); // 315°
    expect(degreesToCompass(null)).toBe('—');
  });

  it('formats direction with abbreviation and degrees', () => {
    expect(formatWindDirection(205)).toBe('SSW · 205°');
    expect(formatWindDirection(null)).toBe('—');
  });
});

describe('UV', () => {
  it('categorizes UV by WHO bands', () => {
    expect(uvCategory(2.9).label).toBe('Low');
    expect(uvCategory(3).label).toBe('Moderate');
    expect(uvCategory(6).label).toBe('High');
    expect(uvCategory(8).label).toBe('Very high');
    expect(uvCategory(11).label).toBe('Extreme');
    expect(uvCategory(null)).toEqual({ label: '—', level: 'none' });
  });
});

describe('countryCodeToFlag', () => {
  it('turns alpha-2 codes into flag emoji', () => {
    expect(countryCodeToFlag('IN')).toBe('🇮🇳');
    expect(countryCodeToFlag('us')).toBe('🇺🇸');
  });

  it('returns empty string for invalid codes', () => {
    expect(countryCodeToFlag('')).toBe('');
    expect(countryCodeToFlag(null)).toBe('');
    expect(countryCodeToFlag('1A')).toBe('');
    expect(countryCodeToFlag('USA')).toBe('');
  });
});

describe('place labels', () => {
  it('joins present parts only', () => {
    expect(formatPlaceLine({ name: 'Kolkata', admin1: 'West Bengal', country: 'India' })).toBe(
      'Kolkata, West Bengal, India',
    );
    expect(formatPlaceLine({ name: 'Kolkata', admin1: null, country: 'India' })).toBe('Kolkata, India');
  });

  it('formats a short chip label', () => {
    expect(formatPlaceShort({ name: 'Kolkata', country: 'India', countryCode: 'IN' })).toBe('Kolkata, India');
    expect(formatPlaceShort({ name: 'Kolkata', country: null, countryCode: 'IN' })).toBe('Kolkata, IN');
    expect(formatPlaceShort({ name: 'Nowhere', country: null, countryCode: null })).toBe('Nowhere');
  });
});

describe('timezone-correct date/time formatting', () => {
  it('parses a naive local ISO string as UTC-anchored', () => {
    const d = parseLocalIso('2026-08-25T13:05');
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(7); // August
    expect(d.getUTCDate()).toBe(25);
    expect(d.getUTCHours()).toBe(13);
    expect(d.getUTCMinutes()).toBe(5);
  });

  it('returns an invalid date for garbage input', () => {
    expect(Number.isNaN(parseLocalIso('not-a-date').getTime())).toBe(true);
  });

  it('formats clock/hour/day the same regardless of the viewer timezone', () => {
    // These use timeZone:'UTC' internally, so they reflect the LOCATION wall
    // clock the provider reported — not the machine running the test.
    expect(formatClock('2026-08-25T13:05')).toBe('1:05 PM');
    expect(formatClock('2026-08-25T00:00')).toBe('12:00 AM');
    expect(formatHour('2026-08-25T13:00')).toBe('1 PM');
    expect(formatWeekday('2026-08-25')).toBe('Tue');
    expect(formatWeekdayLong('2026-08-25')).toBe('Tuesday');
    expect(formatMonthDay('2026-08-25')).toBe('Aug 25');
    expect(formatFullDate('2026-08-25')).toBe('Tuesday, August 25');
  });

  it('shows a dash for unparseable input instead of "Invalid Date"', () => {
    expect(formatClock('nope')).toBe('—');
  });

  it('formats an updated label', () => {
    expect(formatUpdatedLabel('2026-08-25T13:05')).toBe('Updated 1:05 PM local time');
  });
});

describe('location-local clock', () => {
  // Fixed base instant: 2026-08-25T07:30:00Z.
  const base = Date.UTC(2026, 7, 25, 7, 30, 0);

  it('offsets the base instant by the location offset', () => {
    const d = locationNow(19800, base); // +5:30 -> 13:00 local
    expect(d.getUTCHours()).toBe(13);
    expect(d.getUTCMinutes()).toBe(0);
  });

  it('formats a live location clock deterministically', () => {
    expect(formatLocationClock(19800, base)).toBe('1:00 PM');
    expect(formatLocationClock(0, base)).toBe('7:30 AM');
    expect(formatLocationClock(-8 * 3600, base)).toBe('11:30 PM'); // previous day, LA
  });

  it('computes the location-local calendar date, including day rollover', () => {
    expect(locationDateKey(19800, base)).toBe('2026-08-25');
    // Late-evening UTC that is already the next day in Kolkata.
    const lateUtc = Date.UTC(2026, 7, 24, 20, 0, 0);
    expect(locationDateKey(19800, lateUtc)).toBe('2026-08-25');
  });

  it('labels the current local day as "Today", otherwise the weekday', () => {
    expect(dayLabel('2026-08-25', 19800, base)).toBe('Today');
    expect(dayLabel('2026-08-26', 19800, base)).toBe('Wed');
  });
});
