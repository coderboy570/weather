/**
 * Application-level error with an HTTP status, a machine-readable `code`, and a
 * message that is SAFE to show the end user. Internal details (upstream bodies,
 * stack traces) are never placed in `message` — they are logged separately.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message = 'Invalid request.', code = 'BAD_REQUEST') {
    return new AppError(400, code, message);
  }

  static notFound(message = 'Not found.', code = 'NOT_FOUND') {
    return new AppError(404, code, message);
  }

  static tooManyRequests(
    message = 'Weather service is temporarily busy. Please try again shortly.',
    code = 'RATE_LIMITED',
  ) {
    return new AppError(429, code, message);
  }

  static badGateway(
    message = 'Weather service is temporarily unavailable. Please try again.',
    code = 'UPSTREAM_ERROR',
  ) {
    return new AppError(502, code, message);
  }

  static serviceUnavailable(
    message = 'Weather service is temporarily unavailable. Please try again.',
    code = 'SERVICE_UNAVAILABLE',
  ) {
    return new AppError(503, code, message);
  }
}
