# client-bids-wallet-pollar-consumer

SQS polling consumer for bids and wallet events. Proxies bid operations to the Binara service and persists data to Aurora DSQL via TypeORM.

---

## Project Structure

```
src/
├── index.ts                        # Entry point — bootstraps the server
├── config/
│   ├── index.ts                    # Selects config by NODE_ENV
│   ├── development.ts
│   ├── qa.ts
│   └── production.ts
├── core/
│   ├── app.ts                      # Express app — registers routes & middlewares
│   └── server.ts                   # Bootstrap: secrets → DSQL → HTTP server
├── infrastructure/
│   ├── dsql/
│   │   ├── DsqlConfig.ts           # TypeORM DataSource — writeDataSource + readDataSource
│   │   ├── entities/               # TypeORM @Entity classes
│   │   │   ├── User.entity.ts
│   │   │   └── index.ts
│   │   └── repositories/           # Raw SQL table access classes
│   │       ├── BidsTable.ts
│   │       └── index.ts
│   └── redis/
│       └── RedisConfig.ts          # ioredis — redisWrite + redisRead + pipeline
├── clients/
│   ├── binara.client.ts            # S2S HTTP client — place/cancel/sell bid
│   └── index.ts
├── consumers/
│   └── index.ts                    # SQS poll loop (skeleton)
├── handlers/
│   └── index.ts                    # Per-message-type handlers (skeleton)
├── services/
│   ├── bid.service.ts              # Business logic — calls BinaraClient
│   └── index.ts
├── controllers/
│   └── bid.controller.ts           # Express request/response handlers
├── routes/
│   ├── health.routes.ts
│   └── bid.routes.ts               # POST /api/v1/bids/place|cancel|sell
├── middlewares/
│   ├── errorHandler.middleware.ts
│   ├── notFoundHandler.middleware.ts
│   ├── i18n.middleware.ts
│   └── validate.middleware.ts
├── utils/
│   ├── logger.ts                   # Winston logger (configurable output/level)
│   ├── responseHandler.ts
│   └── secretsManager.ts           # AWS Secrets Manager client
├── validation/
│   └── user.validation.ts
├── doc/
│   └── swagger.ts                  # Auto-scanning Swagger spec
└── types/
    └── index.d.ts
```

---

## Setup

### Prerequisites

- Node.js 18+
- AWS credentials configured (`~/.aws/credentials` or env vars)
- Aurora DSQL cluster endpoint

### Install

```bash
npm install
```

### Environment

Copy and fill in values:

```bash
cp .env.example .env
```

### Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

---

## Environment Variables

All env vars are read through `src/config/{development,qa,production}.ts`. Read vars fall back to the corresponding write var if not set.

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | HTTP server port |
| `NODE_ENV` | No | `development` | `development` \| `qa` \| `production` |
| `SECRET_ID` | No | `my-nodejs-secret` | AWS Secrets Manager secret ID |

### Aurora DSQL — Write

| Variable | Required | Default | Description |
|---|---|---|---|
| `DSQL_WRITE_HOSTNAME` | Yes | — | Aurora DSQL cluster endpoint |
| `DSQL_WRITE_REGION` | No | `ap-south-1` | AWS region |
| `DSQL_WRITE_USER` | No | `admin` | DB user |
| `DSQL_WRITE_DB_NAME` | No | `postgres` | Database name |
| `DSQL_WRITE_POOL_SIZE` | No | `10` | Max pool connections |

### Aurora DSQL — Read (falls back to write vars)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DSQL_READ_HOSTNAME` | No | `DSQL_WRITE_HOSTNAME` | Read replica endpoint |
| `DSQL_READ_REGION` | No | `DSQL_WRITE_REGION` | AWS region |
| `DSQL_READ_USER` | No | `DSQL_WRITE_USER` | DB user |
| `DSQL_READ_DB_NAME` | No | `DSQL_WRITE_DB_NAME` | Database name |
| `DSQL_READ_POOL_SIZE` | No | `DSQL_WRITE_POOL_SIZE` | Max pool connections |

### Redis — Write

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_WRITE_HOST` | No | `127.0.0.1` | Redis write host |
| `REDIS_WRITE_PORT` | No | `6379` | Redis write port |
| `REDIS_WRITE_PASSWORD` | No | — | Redis write password |
| `REDIS_WRITE_DB` | No | `0` | Redis write DB index |

### Redis — Read (falls back to write vars)

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_READ_HOST` | No | `REDIS_WRITE_HOST` | Redis read host |
| `REDIS_READ_PORT` | No | `REDIS_WRITE_PORT` | Redis read port |
| `REDIS_READ_PASSWORD` | No | `REDIS_WRITE_PASSWORD` | Redis read password |
| `REDIS_READ_DB` | No | `REDIS_WRITE_DB` | Redis read DB index |

### Binara S2S

| Variable | Required | Default | Description |
|---|---|---|---|
| `BINARA_SERVICE_URL` | Yes (non-dev) | `http://localhost:3000` | Binara service base URL |

### Other Services

| Variable | Required | Default | Description |
|---|---|---|---|
| `USER_SERVICE_URL` | No | `http://43.205.205.26:3011` | User service base URL |
| `WALLET_SERVICE_URL` | No | `http://43.205.205.26:3011` | Wallet service base URL |

### Logging

| Variable | Values | Default | Description |
|---|---|---|---|
| `LOG_OUTPUT` | `file`, `console`, `file,console` | `file` | Where logs are written |
| `LOG_LEVEL` | `error`, `warn`, `info`, `debug` | `info` | Minimum severity |
| `LOG_DIR` | any path | `logs` | Directory for log files |

#### Log level hierarchy

```
error  →  warn  →  info  →  debug
```

Setting `LOG_LEVEL=warn` silently drops `info` and `debug` calls.

#### Recommended per environment

```env
# development
LOG_OUTPUT=file,console
LOG_LEVEL=debug

# QA / production
LOG_OUTPUT=file
LOG_LEVEL=warn
```

---

## Logger Usage

```ts
import { Logger } from './utils/logger';

// Uses LOG_OUTPUT / LOG_LEVEL from config (set via env vars)
const logger = new Logger('MyService');

logger.info('Server started');
logger.warn('Retrying connection...');
logger.error({ message: 'Request failed', status: 500, error: err });
logger.debug({ payload, userId });
```

Extra fields passed alongside `message` are appended as inline JSON in the log line:

```
[2026-07-01 12:00:00] ERROR [MyService]: Request failed {"status":500,"error":"..."}
```

### Per-instance overrides

```ts
// Console only for this instance — ignores config default
new Logger('Worker', { output: ['console'] });

// File + console at debug level
new Logger('Debug', { output: ['file', 'console'], level: 'debug' });
```

### Per-call output override

Pass a `LogTarget[]` as the second argument to override targets for a single call only. The instance default is unchanged for all other calls.

```ts
const logger = new Logger('Redis'); // writes to file by default

// This specific call also goes to console
logger.error({ message: 'Pipeline failed', error: err }, ['file', 'console']);

// All other calls still use the instance default
logger.info('Connected');
```

### Log files (when output includes `file`)

| File | Contains |
|---|---|
| `logs/combined.log` | All messages at or above `LOG_LEVEL` |
| `logs/error.log` | `error` level only |

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/bids/place` | Place a bid (proxied to Binara) |
| `POST` | `/api/v1/bids/cancel` | Cancel a bid (proxied to Binara) |
| `POST` | `/api/v1/bids/sell` | Sell a bid (proxied to Binara) |
| `GET` | `/api-docs` | Swagger UI |

---

## TypeScript Config

| Option | Value |
|---|---|
| `target` | `es2019` |
| `module` | `commonjs` |
| `rootDir` | `src/` |
| `outDir` | `dist/` |
| `strict` | `true` |
| `experimentalDecorators` | `true` (TypeORM) |
| `emitDecoratorMetadata` | `true` (TypeORM) |
