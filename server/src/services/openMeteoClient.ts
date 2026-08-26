import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Low-level JSON fetch for the upstream provider. Adds a hard timeout and maps
 * every failure mode to a sanitized AppError so the rest of the app never has
 * to think about raw network errors or leak them to the client.
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.UPSTREAM_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (res.status === 429) {
      throw AppError.tooManyRequests();
    }

    if (!res.ok) {
      logger.warn(`Upstream responded ${res.status} for ${redact(url)}`);
      throw AppError.badGateway();
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof AppError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      logger.warn(`Upstream request timed out: ${redact(url)}`);
      throw AppError.serviceUnavailable('The weather service timed out. Please try again.');
    }

    logger.error('Upstream fetch failed', err instanceof Error ? err.message : err);
    throw AppError.serviceUnavailable(
      'Unable to reach the weather service. Please try again.',
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Strip query strings from logs (defensive — no secrets are in URLs here). */
function redact(url: string): string {
  const q = url.indexOf('?');
  return q === -1 ? url : url.slice(0, q);
}
