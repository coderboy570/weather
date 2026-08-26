/* Tiny leveled logger. Keeps logs structured-ish without pulling in a dependency.
 * In tests we stay quiet unless something is an actual error. */
import { env } from '../config/env';

type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, message: string, meta?: unknown) {
  if (env.isTest && level !== 'error') return;
  const time = new Date().toISOString();
  const prefix = `[${time}] [${level.toUpperCase()}]`;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](prefix, message, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](prefix, message);
  }
}

export const logger = {
  info: (m: string, meta?: unknown) => log('info', m, meta),
  warn: (m: string, meta?: unknown) => log('warn', m, meta),
  error: (m: string, meta?: unknown) => log('error', m, meta),
  debug: (m: string, meta?: unknown) => log('debug', m, meta),
};
