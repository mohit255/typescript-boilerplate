import AppDataSource from "../DsqlConfig";

export interface BidInsertData {
  bidId: string;
  feedBidId?: string | null;
  userId: number;
  marketId: string;
  bidType: number; // 0 -> buy, 1 -> sold
  bidAmount: number;
  totalBidCount: number;
  matchedBidsCount?: number;
  currentBidCount?: number;
  cancelledBidCount?: number;
  soldBidCount?: number;
  bidStatus?: number; // 0 -> iniceated, 1 -> accepted
  refundStatus?: number; // 0 -> no, 2 -> yes
  distributedStatus?: number;
  creditStatus?: number;
}

export interface BidRow extends Required<BidInsertData> {
  rowJson: Record<string, unknown>;
  updatedAt: Date | null;
  createdAt: Date;
}

const TABLE = "bids";

class BidsTable {
  async insert(data: BidInsertData): Promise<BidRow> {
    const query = `
            INSERT INTO ${TABLE} (
                "bidId", "feedBidId", "userId", "marketId", "bidType",
                "rowJson", "createdAt"
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, NOW()
            )
            RETURNING *
        `;

    const rowJson = {
      bidId: data.bidId,
      feedBidId: data.feedBidId ?? null,
      userId: data.userId,
      marketId: data.marketId,
      bidType: data.bidType,
      bidAmount: data.bidAmount,
      totalBidCount: data.totalBidCount,
      matchedBidsCount: data.matchedBidsCount ?? 0,
      currentBidCount: data.currentBidCount ?? 0,
      cancelledBidCount: data.cancelledBidCount ?? 0,
      soldBidCount: data.soldBidCount ?? 0,
      bidStatus: data.bidStatus ?? 0,
      refundStatus: data.refundStatus ?? 0,
      distributedStatus: data.distributedStatus ?? 0,
      creditStatus: data.creditStatus ?? 0,
    };

    const values = [
      data.bidId,
      data.feedBidId ?? null,
      data.userId,
      data.marketId,
      data.bidType,
      JSON.stringify(rowJson),
    ];

    const rows: BidRow[] = await AppDataSource.query(query, values);
    return rows[0];
  }

  async upsertByFeedBidId(data: BidInsertData): Promise<BidRow> {
    const query = `
            INSERT INTO ${TABLE} (
                "bidId", "feedBidId", "userId", "marketId", "bidType",
                "rowJson", "bidStatus", "createdAt"
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, NOW()
            )
            ON CONFLICT ("feedBidId") DO UPDATE SET
                "rowJson"            = EXCLUDED."rowJson",
                "bidStatus"          = EXCLUDED."bidStatus",
                "updatedAt"          = NOW()
            RETURNING *
        `;

    const rowJson = {
      bidId: data.bidId,
      feedBidId: data.feedBidId ?? null,
      userId: data.userId,
      marketId: data.marketId,
      bidType: data.bidType,
      bidAmount: data.bidAmount,
      totalBidCount: data.totalBidCount,
      matchedBidsCount: data.matchedBidsCount ?? 0,
      currentBidCount: data.currentBidCount ?? 0,
      cancelledBidCount: data.cancelledBidCount ?? 0,
      soldBidCount: data.soldBidCount ?? 0,
      bidStatus: data.bidStatus ?? 0,
      refundStatus: data.refundStatus ?? 0,
      distributedStatus: data.distributedStatus ?? 0,
      creditStatus: data.creditStatus ?? 0,
    };

    const values = [
      data.bidId,
      data.feedBidId ?? null,
      data.userId,
      data.marketId,
      data.bidType,
      JSON.stringify(rowJson),
      data.bidStatus ?? 0,
    ];

    const rows: BidRow[] = await AppDataSource.query(query, values);
    return rows[0];
  }

  async fetch(query?: {
    userId?: number;
    marketId?: string;
    rowJson?: any;
  }): Promise<BidRow[]> {
    const { userId, marketId, rowJson } = query ?? {};
    const conditions: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (userId !== undefined) {
      conditions.push(`"userId" = $${index}`);
      values.push(userId);
      index++;
    }

    if (marketId !== undefined) {
      conditions.push(`"marketId" = $${index}`);
      values.push(marketId);
      index++;
    }

    if (rowJson !== undefined) {
      const field = Object.keys(rowJson)[0];
      conditions.push(`"rowJson"->>'${field}' = $${index}`);
      values.push(Object.values(rowJson)[0]);
      index++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    console.log(whereClause, values);

    const rows: BidRow[] = await AppDataSource.query(
      `SELECT * FROM ${TABLE} ${whereClause}`,
      values,
    );
    return rows;
  }
}

export default new BidsTable();
