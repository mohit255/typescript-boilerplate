import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";

const logger = new Logger("NotFoundHandler");

export class NotFoundHandler {
  public static handle(req: Request, _res: Response, next: NextFunction): void {
    const message = `🔍 Not Found - ${req.originalUrl}`;
    const error = new Error(message) as any;
    error.status = 404;

    logger.warn({
      message,
      method: req.method,
      path: req.originalUrl,
      statusCode: 404,
    });

    next(error);
  }
}
