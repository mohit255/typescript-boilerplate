import { App } from "./app";
import { connectDsql, closeDsqlPool } from "../infrastructure/dsql/DsqlConfig";
import { connectRedis, closeRedis } from "../infrastructure/redis/RedisConfig";
import { SecretService } from "../utils/secretsManager";
import { Logger } from "../utils/logger";
import appConfig from "../config/index";
import dotenv from "dotenv";

const logger = new Logger("Server");

dotenv.config();

interface ServerConfig {
  port?: number;
  secretId?: string;
  enableLogs?: boolean;
}

export class Server {
  private readonly port: number;
  private readonly secretId: string;
  private readonly enableLogs: boolean;

  constructor(config?: ServerConfig) {
    this.port = config?.port || 4000;
    this.secretId =
      config?.secretId || process.env.SECRET_ID || "my-nodejs-secret";
    this.enableLogs = config?.enableLogs ?? true;
  }

  private async loadSecrets(): Promise<void> {
    const secretService = new SecretService();
    const secrets = await secretService.getSecret(this.secretId);

    if (
      !secrets ||
      !secrets.DSQL_WRITE_HOSTNAME ||
      !secrets.DSQL_WRITE_USER ||
      !secrets.DSQL_WRITE_DB_NAME
    ) {
      throw new Error("Incomplete secrets fetched from Secret Manager.");
    }

    // DSQL
    process.env.DSQL_WRITE_HOSTNAME = secrets.DSQL_WRITE_HOSTNAME;
    process.env.DSQL_WRITE_USER = secrets.DSQL_WRITE_USER;
    process.env.DSQL_WRITE_DB_NAME = secrets.DSQL_WRITE_DB_NAME;
    if (secrets.DSQL_READ_HOSTNAME) {
      process.env.DSQL_READ_HOSTNAME = secrets.DSQL_READ_HOSTNAME;
    }

    // Redis
    if (secrets.REDIS_WRITE_HOST)
      process.env.REDIS_WRITE_HOST = secrets.REDIS_WRITE_HOST;
    if (secrets.REDIS_WRITE_PASSWORD)
      process.env.REDIS_WRITE_PASSWORD = secrets.REDIS_WRITE_PASSWORD;
    if (secrets.REDIS_READ_HOST)
      process.env.REDIS_READ_HOST = secrets.REDIS_READ_HOST;
    if (secrets.REDIS_READ_PASSWORD)
      process.env.REDIS_READ_PASSWORD = secrets.REDIS_READ_PASSWORD;

    if (this.enableLogs) logger.info("✅ Secrets loaded successfully.");
  }

  private handleGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.warn(`⚠️ ${signal} received: Shutting down.`);
      await Promise.all([closeDsqlPool(), closeRedis()]);
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }

  public async bootstrap(): Promise<void> {
    try {
      // await this.loadSecrets();

      // Both connections start after secrets are in process.env
      const dsqlResult = await connectDsql().catch((err: Error) => err);
      if (dsqlResult instanceof Error) {
        const msg = `DSQL unavailable: ${dsqlResult.message}`;
        if (appConfig.mode === "production") throw dsqlResult;
        logger.warn({ message: msg }, ["file", "console"]);
      }
      await connectRedis();

      if (this.enableLogs) logger.info("✅ DSQL + Redis connected.");

      const appInstance = new App().instance;

      appInstance.listen(this.port, () => {
        logger.info(`🚀 Server started at http://localhost:${this.port}`, [
          "file",
          "console",
        ]);
      });

      this.handleGracefulShutdown();
    } catch (error) {
      const stack = error instanceof Error ? error.stack : String(error);
      console.error("❌ Server failed to start:\n", stack);
      logger.error({ message: "❌ Server failed to start", error: stack }, [
        "file",
        "console",
      ]);
      setTimeout(() => process.exit(1), 500);
    }
  }
}
