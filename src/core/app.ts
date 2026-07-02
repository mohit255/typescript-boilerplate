import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "../routes/health.routes";
import bidRoutes from "../routes/bid.routes";
import { NotFoundHandler } from "../middlewares/notFoundHandler.middleware";
import { ErrorHandler } from "../middlewares/errorHandler.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../doc/swagger";

export class App {
  public instance: Application;

  constructor() {
    this.instance = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: true }));
    this.instance.use(cors());
    this.instance.use(helmet());
    this.instance.use(morgan("dev"));
  }

  private setupRoutes(): void {
    this.instance.use("/health", healthRoutes);
    this.instance.use("/api/v1/bids", bidRoutes);
    this.instance.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec),
    );
  }

  private setupErrorHandling(): void {
    this.instance.use(NotFoundHandler.handle);
    this.instance.use(ErrorHandler.handle);
  }
}
