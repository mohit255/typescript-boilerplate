import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
  transport,
} from "winston";
import path from "path";
import config from "../config/index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogTarget = "file" | "console";
export type LogLevel = "error" | "warn" | "info" | "debug";

export interface LoggerOptions {
  /** Override output targets for this instance. Falls back to config.logging defaults. */
  output?: LogTarget[];
  /** Override log level for this instance. Falls back to config.logging.level. */
  level?: LogLevel;
}

// ─── Global defaults from config ──────────────────────────────────────────────

function parseOutput(raw: string): LogTarget[] {
  return raw
    .split(",")
    .map((s) => s.trim() as LogTarget)
    .filter((s) => s === "file" || s === "console");
}

const DEFAULT_OUTPUT: LogTarget[] = parseOutput(
  (config.logging?.output as string) || "file",
);
const DEFAULT_LEVEL: LogLevel = (config.logging?.level as LogLevel) || "info";
const LOG_DIR: string = (config.logging?.dir as string) || "logs";

// ─── Shared format ────────────────────────────────────────────────────────────

const buildFormat = (context?: string) =>
  format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf((info) => {
      const prefix = `[${info.timestamp}] ${info.level.toUpperCase()}${context ? ` [${context}]` : ""}`;

      const {
        timestamp: _ts,
        level: _lvl,
        message,
        ...extra
      } = info as Record<string, unknown>;

      const msg =
        typeof message === "object"
          ? JSON.stringify(message, null, 2)
          : (message as string);

      const extraStr =
        Object.keys(extra).length > 0
          ? " " + JSON.stringify(extra, null, 0)
          : "";

      return `${prefix}: ${msg}${extraStr}`;
    }),
  );

// ─── Transport factory (Strategy pattern) ─────────────────────────────────────

function buildTransports(
  targets: LogTarget[],
  level: LogLevel,
  context?: string,
): transport[] {
  const list: transport[] = [];

  if (targets.includes("console")) {
    list.push(
      new transports.Console({
        level,
        format: format.combine(
          format.colorize({ all: true }),
          buildFormat(context),
        ),
      }),
    );
  }

  if (targets.includes("file")) {
    list.push(
      new transports.File({
        filename: path.resolve(LOG_DIR, "error.log"),
        level: "error",
        format: buildFormat(context),
      }),
      new transports.File({
        filename: path.resolve(LOG_DIR, "combined.log"),
        level,
        format: buildFormat(context),
      }),
    );
  }

  return list;
}

// ─── Logger class ─────────────────────────────────────────────────────────────

export class Logger {
  private logger: WinstonLogger;
  private readonly context?: string;
  private readonly level: LogLevel;
  private readonly overrideCache = new Map<string, WinstonLogger>();

  constructor(context?: string, opts: LoggerOptions = {}) {
    this.context = context;
    this.level = opts.level ?? DEFAULT_LEVEL;

    this.logger = createLogger({
      level: this.level,
      transports: buildTransports(
        opts.output ?? DEFAULT_OUTPUT,
        this.level,
        context,
      ),
    });
  }

  private logWith(
    severity: LogLevel,
    message: string | object,
    output?: LogTarget[],
  ): void {
    if (output) {
      const key = [...output].sort().join(",");
      if (!this.overrideCache.has(key)) {
        this.overrideCache.set(
          key,
          createLogger({
            level: this.level,
            transports: buildTransports(output, this.level, this.context),
          }),
        );
      }
      this.overrideCache.get(key)![severity](message);
    } else {
      this.logger[severity](message);
    }
  }

  info(message: string | object, output?: LogTarget[]): void {
    this.logWith("info", message, output);
  }
  warn(message: string | object, output?: LogTarget[]): void {
    this.logWith("warn", message, output);
  }
  error(message: string | object, output?: LogTarget[]): void {
    this.logWith("error", message, output);
  }
  debug(message: string | object, output?: LogTarget[]): void {
    this.logWith("debug", message, output);
  }
}
