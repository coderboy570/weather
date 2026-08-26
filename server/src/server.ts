import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🌦️  Weather API listening on http://localhost:${env.PORT}  (${env.NODE_ENV})`);
  logger.info(`   Allowed origins: ${env.allowedOrigins.join(', ') || '(none)'}`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully.`);
  server.close(() => process.exit(0));
  // Force-exit if connections linger.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
