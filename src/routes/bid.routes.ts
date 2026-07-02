import { Router } from "express";
import { BidController } from "../controllers/bid.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bids
 *   description: Bid operations (proxied to Binara service)
 */

/**
 * @swagger
 * /api/v1/bids/place:
 *   post:
 *     summary: Place a new bid
 *     tags: [Bids]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bidId, userId, marketId, bidType, bidAmount, totalBidCount]
 *             properties:
 *               bidId:        { type: string }
 *               feedBidId:    { type: string }
 *               userId:       { type: number }
 *               marketId:     { type: string }
 *               bidType:      { type: number, description: "0 = buy, 1 = sold" }
 *               bidAmount:    { type: number }
 *               totalBidCount: { type: number }
 *     responses:
 *       201:
 *         description: Bid placed
 */
router.post("/place", BidController.placeBid);

/**
 * @swagger
 * /api/v1/bids/cancel:
 *   post:
 *     summary: Cancel an existing bid
 *     tags: [Bids]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bidId, userId, marketId]
 *             properties:
 *               bidId:    { type: string }
 *               userId:   { type: number }
 *               marketId: { type: string }
 *               reason:   { type: string }
 *     responses:
 *       200:
 *         description: Bid cancelled
 */
router.post("/cancel", BidController.cancelBid);

/**
 * @swagger
 * /api/v1/bids/sell:
 *   post:
 *     summary: Sell (execute) an existing bid
 *     tags: [Bids]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bidId, userId, marketId, soldAmount, soldBidCount]
 *             properties:
 *               bidId:        { type: string }
 *               userId:       { type: number }
 *               marketId:     { type: string }
 *               soldAmount:   { type: number }
 *               soldBidCount: { type: number }
 *     responses:
 *       200:
 *         description: Bid sold
 */
router.post("/sell", BidController.sellBid);

export default router;
