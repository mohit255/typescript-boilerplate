import { App } from './app';
import { Database } from '../config/database';
import { SecretService } from '../utils/secretsManager';
import { Logger } from '../config/logger';
import dotenv from 'dotenv';
const logger = new Logger('Server');

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
    this.port = config?.port || Number(process.env.PORT) || 3000;
    this.secretId = config?.secretId || process.env.SECRET_ID || 'my-nodejs-secret';
    this.enableLogs = config?.enableLogs ?? true;
  }

  private async loadSecrets(): Promise<void> {
    const secretService = new SecretService();
    const secrets = await secretService.getSecret(this.secretId);
    if (
      !secrets ||
      !secrets.DB_HOST ||
      !secrets.DB_PORT ||
      !secrets.DB_USER ||
      !secrets.DB_PASS ||
      !secrets.DB_NAME
    ) {
      throw new Error('Incomplete secrets fetched from Secret Manager.');
    }

    process.env.DB_HOST = secrets.DB_HOST;
    process.env.DB_PORT = String(secrets.DB_PORT);
    process.env.DB_USER = secrets.DB_USER;
    process.env.DB_PASS = secrets.DB_PASS;
    process.env.DB_NAME = secrets.DB_NAME;

    if (this.enableLogs) {
      logger.info('✅ Secrets loaded successfully.');
    }
  }

  private async initializeDatabase(): Promise<void> {
    await Database.initialize();
    if (this.enableLogs) {
      logger.info('✅ Database connected successfully.');
    }
  }

  private handleGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      logger.warn('⚠️ SIGINT received: Shutting down.');
      await Database.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.warn('⚠️ SIGTERM received: Shutting down.');
      await Database.destroy();
      process.exit(0);
    });
  }

  public async bootstrap(): Promise<void> {
    try {
      // await this.loadSecrets();
      await this.initializeDatabase();

      const appInstance = new App().instance;

      appInstance.listen(this.port, () => {
        logger.info(`🚀 Server started at http://localhost:${this.port}`);
      });

      this.handleGracefulShutdown();
    } catch (error) {
      console.log('Error: -------', error instanceof Error ? error.stack : error);

      logger.error({
        message: '❌ Server failed to start',
        error: error instanceof Error ? error.stack : error,
      });
      process.exit(1);
    }
  }
}
