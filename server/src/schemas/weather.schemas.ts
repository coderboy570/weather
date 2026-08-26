import { z } from 'zod';

/** Treat empty strings (e.g. `?lat=`) as "not provided" before validation. */
const emptyToUndefined = (v: unknown) =>
  v === '' || v === null ? undefined : v;

const citySchema = z
  .preprocess(emptyToUndefined, z.string().trim().min(1).max(120).optional());

const latSchema = z
  .preprocess(emptyToUndefined, z.coerce.number().min(-90).max(90).optional());

const lonSchema = z
  .preprocess(emptyToUndefined, z.coerce.number().min(-180).max(180).optional());

/**
 * Weather query: caller must supply EITHER `city` OR both `lat` and `lon`.
 * Used by /api/weather, /api/weather/current and /api/weather/forecast.
 */
export const weatherQuerySchema = z
  .object({
    city: citySchema,
    lat: latSchema,
    lon: lonSchema,
  })
  .refine((d) => Boolean(d.city) || (d.lat !== undefined && d.lon !== undefined), {
    message: 'Provide either a "city" or both "lat" and "lon" query parameters.',
    path: ['city'],
  })
  .refine((d) => (d.lat === undefined) === (d.lon === undefined), {
    message: 'Both "lat" and "lon" must be provided together.',
    path: ['lat'],
  });

export type WeatherQuery = z.infer<typeof weatherQuerySchema>;

/** Geocoding search query for the autocomplete dropdown. */
export const geoSearchSchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(120)),
  count: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(10).optional().default(5),
  ),
});

export type GeoSearchQuery = z.infer<typeof geoSearchSchema>;
