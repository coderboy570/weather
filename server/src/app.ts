import path from 'node:path';
import fs from 'node:fs';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRoutes from './routes';
import { apiRateLimiter } from './middleware/rateLimiter';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

/**
 * Builds and configures the Express app WITHOUT starting a listener, so tests
 * (Supertest) can import it directly. `server.ts` wraps this with `.listen()`.
 */
export function createApp(): Express {
  const app = express();

  // We sit behind at most one proxy in production (e.g. Render). This makes
  // client IPs accurate for rate limiting without being over-permissive.
  app.set('trust proxy', 1);

  // Secure HTTP headers. CSP is intentionally disabled: this process is an API
  // (optionally also serving a prebuilt SPA), and a strict API-oriented CSP
  // tends to break the SPA without adding meaningful protection here.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Restrict browser cross-origin access to the configured origins.
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header => same-origin, curl, server-to-server, health checks.
        if (!origin) return callback(null, true);
        if (env.allowedOrigins.includes(origin)) return callback(null, true);
        // Disallowed browser origin: omit CORS headers (browser blocks the read)
        // rather than throwing a 500.
        return callback(null, false);
      },
      methods: ['GET'],
    }),
  );

  app.use(express.json({ limit: '10kb' }));

  // All API routes are rate limited.
  app.use('/api', apiRateLimiter, apiRoutes);

  // If a production client build is present, serve it (single-service deploy).
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    logger.info(`Serving static client from ${clientDist}`);
  }

  // 404 + centralized error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
