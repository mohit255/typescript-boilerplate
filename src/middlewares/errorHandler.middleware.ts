import { Request, Response } from 'express';
import { Logger } from '../config/logger';
import { ResponseHandler } from '../utils/responseHandler';

const logger = new Logger('ErrorHandler');

interface CustomError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  public static handle(err: CustomError, req: Request, res: Response): void {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    logger.error({
      message,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });

    return ResponseHandler.error(
      res,
      message,
      {
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        ...(err.code && { code: err.code }),
        ...(err.details && { details: err.details }),
      },
      statusCode,
    );
  }
}
