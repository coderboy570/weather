import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/** Fallback for any route that doesn't match — forwarded to the error handler. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.path}`, 'ROUTE_NOT_FOUND'));
}
