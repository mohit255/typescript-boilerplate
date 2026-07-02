import "reflect-metadata";
import { DataSource } from "typeorm";
import { DsqlSigner } from "@aws-sdk/dsql-signer";
import config from "../../config/index";
import { Logger } from "../../utils/logger";

const logger = new Logger("DSQL");

// ─── Factory ──────────────────────────────────────────────────────────────────

function createDataSource(
  cfg: typeof config.aws.dsql.write,
  name: string,
): DataSource {
  const signer = new DsqlSigner({
    hostname: cfg.hostname as string,
    region: cfg.region as string,
  });

  return new DataSource({
    type: "postgres",
    name,
    host: cfg.hostname as string,
    port: 5432,
    username: cfg.user,
    database: cfg.dbname,
    password: () => signer.getDbConnectAdminAuthToken(),
    ssl: { rejectUnauthorized: true },
    poolSize: cfg.poolSize ?? 10,
    synchronize: false,
    logging: false,
    entities: [],
  });
}

// ─── Connections ──────────────────────────────────────────────────────────────

/** Use for INSERT / UPDATE / DELETE */
export const writeDataSource = createDataSource(
  config.aws.dsql.write,
  "dsql-write",
);

/** Use for SELECT — falls back to write endpoint if DSQL_READ_HOSTNAME is not set */
export const readDataSource = createDataSource(
  config.aws.dsql.read,
  "dsql-read",
);

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export async function connectDsql(): Promise<void> {
  logger.info("Connecting write + read...", ["file", "console"]);
  try {
    await Promise.all([
      writeDataSource.initialize(),
      readDataSource.initialize(),
    ]);
    logger.info("Write + Read connected.", ["file", "console"]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ message: "Connection failed", error: msg }, [
      "file",
      "console",
    ]);
    throw error;
  }
}

export async function closeDsqlPool(): Promise<void> {
  logger.info("Closing pool...", ["file", "console"]);
  await Promise.all([
    writeDataSource.isInitialized
      ? writeDataSource.destroy()
      : Promise.resolve(),
    readDataSource.isInitialized ? readDataSource.destroy() : Promise.resolve(),
  ]);
  logger.info("Pool closed.", ["file", "console"]);
}

// Default export is write — safest fallback
export default writeDataSource;
