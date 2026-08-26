import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from a local `.env` (in the server working directory) into
// process.env. No-op if the file is absent (e.g. on hosts where env vars are
// injected directly). `override: false` means real env vars always win.
dotenv.config();

/**
 * Environment schema. Everything has a sensible default so the app boots even
 * with an empty .env — Open-Meteo needs no key. Values are coerced + validated
 * once at startup so the rest of the code can rely on correct types.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  WEATHER_CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(300),
  GEO_CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(86_400),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  OPEN_METEO_FORECAST_URL: z
    .string()
    .url()
    .default('https://api.open-meteo.com/v1/forecast'),
  OPEN_METEO_GEOCODING_URL: z
    .string()
    .url()
    .default('https://geocoding-api.open-meteo.com/v1/search'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable message rather than crashing deep in a request.
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  /** Parsed list of allowed CORS origins. */
  allowedOrigins: raw.ALLOWED_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
} as const;

export type AppEnv = typeof env;
