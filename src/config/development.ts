export default {
  mode: "development",
  port: Number(process.env.PORT || 4000),
  aws: {
    region: process.env.AWS_REGION || "ap-south-1",
    dsql: {
      write: {
        hostname: process.env.DSQL_WRITE_HOSTNAME,
        region:
          process.env.DSQL_WRITE_REGION ||
          process.env.AWS_REGION ||
          "ap-south-1",
        user: process.env.DSQL_WRITE_USER || "admin",
        dbname: process.env.DSQL_WRITE_DB_NAME || "postgres",
        poolSize: Number(process.env.DSQL_WRITE_POOL_SIZE || 10),
      },
      read: {
        hostname:
          process.env.DSQL_READ_HOSTNAME || process.env.DSQL_WRITE_HOSTNAME,
        region:
          process.env.DSQL_READ_REGION ||
          process.env.DSQL_WRITE_REGION ||
          process.env.AWS_REGION ||
          "ap-south-1",
        user:
          process.env.DSQL_READ_USER || process.env.DSQL_WRITE_USER || "admin",
        dbname:
          process.env.DSQL_READ_DB_NAME ||
          process.env.DSQL_WRITE_DB_NAME ||
          "postgres",
        poolSize: Number(
          process.env.DSQL_READ_POOL_SIZE ||
            process.env.DSQL_WRITE_POOL_SIZE ||
            10,
        ),
      },
    },
  },
  redis: {
    write: {
      host: process.env.REDIS_WRITE_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_WRITE_PORT || 6379),
      password: process.env.REDIS_WRITE_PASSWORD || undefined,
      db: Number(process.env.REDIS_WRITE_DB || 0),
    },
    read: {
      host:
        process.env.REDIS_READ_HOST ||
        process.env.REDIS_WRITE_HOST ||
        "127.0.0.1",
      port: Number(
        process.env.REDIS_READ_PORT || process.env.REDIS_WRITE_PORT || 6379,
      ),
      password:
        process.env.REDIS_READ_PASSWORD ||
        process.env.REDIS_WRITE_PASSWORD ||
        undefined,
      db: Number(process.env.REDIS_READ_DB || process.env.REDIS_WRITE_DB || 0),
    },
  },
  logging: {
    output: process.env.LOG_OUTPUT || "file",
    level: process.env.LOG_LEVEL || "info",
    dir: process.env.LOG_DIR || "logs",
  },
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || "http://43.205.205.26:3011",
  WALLET_SERVICE_URL:
    process.env.WALLET_SERVICE_URL || "http://43.205.205.26:3011",
  BINARA_SERVICE_URL: process.env.BINARA_SERVICE_URL || "http://localhost:3000",
};
