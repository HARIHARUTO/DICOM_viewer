import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { isHttpError } from '../errors.js';
import { logger } from '../logger.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Invalid request parameters.',
        details: error.flatten(),
      },
    });
    return;
  }

  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  logger.error({ error }, 'Unhandled request error');
  res.status(500).json({
    error: {
      message: 'Internal server error.',
    },
  });
};

