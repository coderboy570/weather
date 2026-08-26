import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Per-IP rate limiter for the API. Protects the backend and our upstream quota.
 * Returns the same JSON error shape as the rest of the API on 429.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Disable the limiter entirely during tests so suites are deterministic.
  skip: () => env.isTest,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Weather service is temporarily busy. Please try again shortly.',
      },
    });
  },
});
