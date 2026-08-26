import { describe, expect, it } from 'vitest';
import { locationToPlace, placeKey, samePlace, suggestionToPlace } from './places';
import { makeSuggestion } from '../test/fixtures';
import type { NormalizedLocation } from '../types/weather';

describe('placeKey', () => {
  it('prefers the provider id when present', () => {
    expect(placeKey({ id: 1275004, latitude: 22.5626, longitude: 88.363 })).toBe('id:1275004');
  });

  it('falls back to rounded coordinates when id is missing or zero', () => {
    expect(placeKey({ id: 0, latitude: 22.5626, longitude: 88.363 })).toBe('geo:22.563,88.363');
    expect(placeKey({ latitude: -0.0001, longitude: 100.9999 })).toBe('geo:-0.000,101.000');
  });
});

describe('suggestionToPlace', () => {
  it('keeps the id and identifying fields', () => {
    const place = suggestionToPlace(makeSuggestion());
    expect(place).toEqual({
      id: 1275004,
      name: 'Kolkata',
      country: 'India',
      countryCode: 'IN',
      admin1: 'West Bengal',
      latitude: 22.5626,
      longitude: 88.363,
    });
  });
});

describe('locationToPlace', () => {
  const location: NormalizedLocation = {
    name: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    latitude: 22.5626,
    longitude: 88.363,
    timezone: 'Asia/Kolkata',
    utcOffsetSeconds: 19800,
  };

  it('defaults the id to 0 (coords become the identity)', () => {
    const place = locationToPlace(location);
    expect(place.id).toBe(0);
    expect(placeKey(place)).toBe('geo:22.563,88.363');
  });

  it('accepts an id hint', () => {
    expect(locationToPlace(location, 42).id).toBe(42);
  });
});

describe('samePlace', () => {
  it('compares by placeKey', () => {
    const a = suggestionToPlace(makeSuggestion());
    const b = suggestionToPlace(makeSuggestion({ name: 'Kolkata (dup)' }));
    expect(samePlace(a, b)).toBe(true); // same id
    const c = suggestionToPlace(makeSuggestion({ id: 999, latitude: 1, longitude: 2 }));
    expect(samePlace(a, c)).toBe(false);
  });
});
