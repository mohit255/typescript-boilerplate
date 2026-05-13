import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import path from 'path';

export class Logger {
  private logger: WinstonLogger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // Handles error stack logging
        format.printf((info) => {
          const base = `[${info.timestamp}] ${info.level.toUpperCase()}${this.context ? ` [${this.context}]` : ''}`;
          if (typeof info.message === 'object') {
            return `${base}: ${JSON.stringify(info.message, null, 2)}`;
          }
          return `${base}: ${info.message}`;
        }),
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: path.resolve('logs/error.log'), level: 'error' }),
        new transports.File({ filename: path.resolve('logs/combined.log') }),
      ],
    });
  }

  info(message: string | object): void {
    this.logger.info(message);
  }

  warn(message: string | object): void {
    this.logger.warn(message);
  }

  error(message: string | object): void {
    this.logger.error(message);
  }

  debug(message: string | object): void {
    this.logger.debug(message);
  }
}
