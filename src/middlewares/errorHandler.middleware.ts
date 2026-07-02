import { NextFunction, Request, Response } from "express";
import { Logger } from "../utils/logger";
import { ResponseHandler } from "../utils/responseHandler";
import config from "../config/index";

const logger = new Logger("ErrorHandler");
const isProduction = config.mode === "production";

interface CustomError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static handle(
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";

    logger.error({
      message,
      method: req.method,
      path: req.originalUrl,
      headers: req.headers,
      body: req.body,
      statusCode,
      stack: isProduction ? undefined : err.stack,
    });

    return ResponseHandler.error(
      res,
      message,
      {
        ...(!isProduction && { stack: err.stack }),
        ...(err.code && { code: err.code }),
        ...(err.details && { details: err.details }),
      },
      statusCode,
    );
  }
}
