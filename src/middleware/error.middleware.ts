import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError';
import { logger } from '../lib/logger';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.path}`, 'NOT_FOUND'));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = req.id;

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.flatten()
      },
      requestId
    });
    return;
  }

  const appError = error instanceof AppError
    ? error
    : new AppError(500, 'Internal server error', 'INTERNAL_ERROR');

  if (appError.statusCode >= 500) {
    logger.error({ err: error, requestId }, 'Unhandled request error');
  } else {
    logger.warn({ err: error, requestId }, 'Request failed');
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message
    },
    requestId
  });
};
