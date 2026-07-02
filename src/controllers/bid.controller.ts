import { Request, Response, NextFunction } from "express";
import { BidService } from "../services/bid.service";
import { ResponseHandler } from "../utils/responseHandler";
import {
  getRedisRead,
  getRedisWrite,
} from "../infrastructure/redis/RedisConfig";

export class BidController {
  static async placeBid(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await BidService.placeBid(req.body);
      ResponseHandler.success(res, result, "Bid placed successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  static async cancelBid(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await BidService.cancelBid(req.body);
      ResponseHandler.success(res, result, "Bid cancelled successfully");
    } catch (err) {
      next(err);
    }
  }

  static async sellBid(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await BidService.sellBid(req.body);
      ResponseHandler.success(res, result, "Bid sold successfully");
    } catch (err) {
      next(err);
    }
  }
}
