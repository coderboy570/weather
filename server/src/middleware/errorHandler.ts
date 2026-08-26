import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/** Shape every error response the API sends. */
interface ErrorBody {
  error: {
    code: string;
    message: string;
  };
}

/** Catch-all error handler. Must be registered LAST, after all routes. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is required so Express recognizes this as an error handler (4 args).
  _next: NextFunction,
): void {
  // Malformed JSON body etc.
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' },
    } satisfies ErrorBody);
    return;
  }

  if (err instanceof AppError) {
    // Operational errors carry a user-safe message.
    if (err.statusCode >= 500) {
      logger.error(`AppError ${err.statusCode} ${err.code}: ${err.message}`);
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    } satisfies ErrorBody);
    return;
  }

  // Unknown / programming error — log the detail, return a generic message.
  logger.error('Unhandled error', err instanceof Error ? err.stack ?? err.message : err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our end. Please try again.',
    },
  } satisfies ErrorBody);
}
