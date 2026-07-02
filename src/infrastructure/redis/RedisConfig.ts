import Redis, { ChainableCommander } from "ioredis";
import config from "../../config/index";
import { Logger } from "../../utils/logger";

const logger = new Logger("RedisConfig");

// ─── Instances (created lazily inside connectRedis after secrets are loaded) ──

let redisWriteClient: Redis | null = null;
let redisReadClient: Redis | null = null;

// ─── Factory ──────────────────────────────────────────────────────────────────

function createClient(
  host: string,
  port: number,
  password: string | undefined,
  db: number,
  label: string,
): Redis {
  const client = new Redis({
    host,
    port,
    password,
    db,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 3000),
    lazyConnect: true,
  });

  client.on("error", (err) =>
    logger.error({ message: `[Redis:${label}] Error`, error: err }),
  );
  client.on("reconnecting", () =>
    logger.warn(`[Redis:${label}] Reconnecting...`),
  );

  return client;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export async function connectRedis(): Promise<void> {
  // Config is read here — after secrets are loaded into process.env
  const { write, read } = config.redis;

  const writeHost = write.host;
  const writePort = write.port;
  const writePassword = write.password;
  const writeDb = write.db;

  const readHost = read.host;
  const readPort = read.port;
  const readPassword = read.password;
  const readDb = read.db;

  redisWriteClient = createClient(
    writeHost,
    writePort,
    writePassword,
    writeDb,
    "write",
  );
  redisReadClient = createClient(
    readHost,
    readPort,
    readPassword,
    readDb,
    "read",
  );

  logger.info("Connecting write + read...", ["file", "console"]);
  await Promise.all([redisWriteClient.connect(), redisReadClient.connect()]);
  logger.info("Write + Read connected.", ["file", "console"]);
}

export async function closeRedis(): Promise<void> {
  logger.info("Closing connections...", ["file", "console"]);
  await Promise.all([redisWriteClient?.quit(), redisReadClient?.quit()]);
  redisWriteClient = null;
  redisReadClient = null;
  logger.info("[Redis] Connections closed.", ["file", "console"]);
}

// ─── Accessors ────────────────────────────────────────────────────────────────

/** Use for SET / DEL / PUBLISH / write operations */
export function getRedisWrite(): Redis {
  if (!redisWriteClient)
    throw new Error("Redis write not initialized. Call connectRedis() first.");
  return redisWriteClient;
}

/** Use for GET / read operations */
export function getRedisRead(): Redis {
  if (!redisReadClient)
    throw new Error("Redis read not initialized. Call connectRedis() first.");
  return redisReadClient;
}

// ─── Pipeline (write connection) ──────────────────────────────────────────────

/**
 * Run multiple write commands in a single round-trip.
 *
 * @example
 * await pipeline((pipe) => {
 *   pipe.set("key", "val", "EX", 3600);
 *   pipe.hset("hash", "field", "value");
 * });
 */
export async function pipeline(
  fn: (pipe: ChainableCommander) => void,
): Promise<void> {
  const pipe = getRedisWrite().pipeline();
  fn(pipe);
  const results = await pipe.exec();
  results?.forEach(([err], i) => {
    if (err)
      logger.error(
        {
          message: `[Redis] Pipeline cmd[${i}] failed`,
          error: err,
        },
        ["file", "console"],
      );
  });
}

export default getRedisWrite;
