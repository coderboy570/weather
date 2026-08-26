import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/** Express requests carry validated data under this key after `validateQuery`. */
export interface ValidatedRequest<T> extends Request {
  validatedQuery: T;
}

/**
 * Returns middleware that validates `req.query` against a Zod schema.
 * On success the parsed, typed value is attached as `req.validatedQuery`.
 * On failure a sanitized 400 is forwarded to the error handler.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const first = result.error.errors[0];
      const message = first?.message ?? 'Invalid query parameters.';
      next(AppError.badRequest(message, 'VALIDATION_ERROR'));
      return;
    }
    (req as ValidatedRequest<T>).validatedQuery = result.data;
    next();
  };
}

/** Type-safe accessor for the value attached by `validateQuery`. */
export function getValidated<T>(req: Request): T {
  return (req as ValidatedRequest<T>).validatedQuery;
}
