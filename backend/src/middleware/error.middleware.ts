import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ENV } from '../config/env';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const error = err as Error;
  console.error('[UNSAID Error]', error.stack || error.message);

  const statusCode = (error as unknown as { statusCode?: number }).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && ENV.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message || 'Internal server error',
  });
};
