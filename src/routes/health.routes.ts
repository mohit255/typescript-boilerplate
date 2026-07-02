// src/routes/health.routes.ts
import { Router, Request, Response } from "express";

class HealthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check
     *     description: Returns the service status and current timestamp.
     *     responses:
     *       200:
     *         description: Service is up and running
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: ok
     *                 timestamp:
     *                   type: string
     *                   example: "2025-06-02T12:00:00Z"
     */
    this.router.get("/", this.healthCheck);
  }

  private healthCheck(req: Request, res: Response): void {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }
}

export default new HealthRoutes().router;
