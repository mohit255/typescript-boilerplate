# Node.js TypeScript Express Boilerplate

A scalable, production-ready boilerplate for building RESTful APIs using **Node.js**, **TypeScript**, **Express.js**, and **TypeORM**, with **Winston Logger**, **Swagger Documentation**, and **modular project structure**.

---

## Table of Contents

* [Features](#features)
* [Directory Structure](#directory-structure)
* [Getting Started](#getting-started)
* [Scripts](#scripts)
* [Environment Variables](#environment-variables)
* [Project Conventions](#project-conventions)
* [API Documentation (Swagger)](#api-documentation-swagger)
* [Logger Usage](#logger-usage)
* [Error Handling](#error-handling)
* [Adding a New Route](#adding-a-new-route)
* [Running in Production](#running-in-production)
* [License](#license)

---

## Features

* TypeScript support
* Express.js with class-based controllers
* TypeORM for database ORM
* PostgreSQL/MySQL ready
* Centralized error handling
* Winston logger with file and console transports
* Swagger for API documentation
* Modular folder structure for scaling

---

## Directory Structure

```bash
├── src
│   ├── config              # App config & setup
│   │   ├── logger.ts       # Winston logger configuration
│   │   └── ormconfig.ts    # TypeORM config setup
│   ├── controllers         # All HTTP controllers (class-based)
│   │   └── user.controller.ts
│   ├── core                # Core setup of App and Server
│   │   ├── App.ts          # Express App wrapped in a class
│   │   └── Server.ts       # Main Server class with initialization
│   ├── docs                # Swagger docs setup and specs
│   │   └── swagger.ts
│   ├── entities            # TypeORM entities/models
│   │   └── User.ts
│   ├── middlewares         # Global & route-level middlewares
│   │   ├── error.middleware.ts
│   │   └── notFound.middleware.ts
│   ├── routes              # API routes, organized by resource
│   │   └── user.routes.ts
│   ├── utils               # Utility helpers and modules
│   │   └── secretsManager.ts
│   └── index.ts            # Application entry point
├── logs                    # All log files go here
│   ├── error.log
│   └── combined.log
├── .env                    # Environment variables
├── tsconfig.json           # TypeScript compiler config
├── package.json            # Project scripts and dependencies
└── README.md               # You are here
```

---

## Getting Started

### Prerequisites

* Node.js >= 18.x
* npm >= 9.x
* PostgreSQL/MySQL

### Installation

```bash
git clone https://github.com/yourusername/node-ts-typeorm-boilerplate.git
cd node-ts-typeorm-boilerplate
npm install
```

### Setup Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

### Run Project

```bash
npm run dev      # Development with ts-node & nodemon
npm run build    # Compile TypeScript
npm run start    # Run compiled code
```

---

## Scripts

| Script          | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JS         |
| `npm start`     | Start compiled JavaScript        |

---

## Environment Variables

Required environment variables and their purpose:

| Key           | Description                          |
| ------------- | ------------------------------------ |
| `PORT`        | Port on which server runs            |
| `NODE_ENV`    | Environment (development/production) |
| `DB_HOST`     | Database host                        |
| `DB_PORT`     | Database port                        |
| `DB_USERNAME` | DB username                          |
| `DB_PASSWORD` | DB password                          |
| `DB_NAME`     | Database name                        |

---

## Project Conventions

### File Naming

* All file names are **kebab-case**.
* Class files should have PascalCase classes inside but filenames remain kebab-case.

### Folder Naming

* `controllers`, `routes`, `entities`, etc. are **singular**.

### Class Naming

* `UserController`, `Logger`, `Database`, etc. use **PascalCase**.

### Entity Naming

* Entity names follow `PascalCase`.

---

## API Documentation (Swagger)

Auto-generated via annotations using `swagger-jsdoc`.

### Access Swagger UI:

```
GET http://localhost:5000/api-docs
```

### Add Swagger Comment:

```ts
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
```

Swagger is configured in `src/docs/swagger.ts`

---

## Logger Usage

Logger is created using `winston` and wrapped in a `Logger` class.

```ts
import { Logger } from '../utils/logger';
const logger = new Logger('UserController');

logger.info('User fetched');
logger.error('Failed to fetch user');
```

### Logs location:

* Console
* `logs/error.log`
* `logs/combined.log`

---

## Error Handling

Centralized error handling via middleware:

```ts
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as any).status || 500;
  res.status(statusCode).json({ message: err.message });
};
```

404 handler:

```ts
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
};
```

---

## Adding a New Route

1. **Create a Controller** (`src/controllers/order.controller.ts`):

```ts
export class OrderController {
  static async getAll(req: Request, res: Response): Promise<void> {
    res.json([{ id: 1, item: 'Book' }]);
  }
}
```

2. **Add Route** (`src/routes/order.routes.ts`):

```ts
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();
router.get('/', OrderController.getAll);
export default router;
```

3. **Register Route in App** (`src/core/server.ts` or `index.ts`):

```ts
app.use('/api/orders', orderRoutes);
```

---

## Running in Production

1. Set `NODE_ENV=production`
2. Build project: `npm run build`
3. Run with PM2 or node: `npm start`
4. Setup logging rotation or ship logs to ELK/Datadog

---

## License

This boilerplate is licensed under the MIT License.

---

Happy coding! 🎯
