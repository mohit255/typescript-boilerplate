import config from "../config/index";
import { Logger } from "../utils/logger";

const logger = new Logger("BinaraClient");

type QueryParams = Record<string, string | number | boolean | undefined | null>;
type Headers = Record<string, string>;
type Body = Record<string, unknown>;

interface GetOptions {
  query?: QueryParams;
  headers?: Headers;
}

interface PostOptions {
  query?: QueryParams;
  headers?: Headers;
  body?: Body;
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface PlaceBidRequest {
  bidId: string;
  feedBidId?: string | null;
  userId: number;
  marketId: string;
  bidType: number; // 0 → buy, 1 → sold
  bidAmount: number;
  totalBidCount: number;
}

export interface CancelBidRequest {
  bidId: string;
  userId: number;
  marketId: string;
  reason?: string;
}

export interface SellBidRequest {
  bidId: string;
  userId: number;
  marketId: string;
  soldAmount: number;
  soldBidCount: number;
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface BidResponse {
  success: boolean;
  bidId: string;
  status: number;
  message?: string;
}

// ─── Common headers / query applied to every request ─────────────────────────

const commonHeaders: Headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Source-Service": "client-bids-wallet-pollar-consumer",
};

const commonQuery: QueryParams = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(path: string, query?: QueryParams): string {
  const base = config.BINARA_SERVICE_URL as string;
  const url = new URL(path, base.endsWith("/") ? base : base + "/");

  const merged: QueryParams = { ...commonQuery, ...query };
  for (const [key, val] of Object.entries(merged)) {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, String(val));
    }
  }

  return url.toString();
}

async function handleResponse<T>(
  res: Response,
  path: string,
  method: string,
): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = `${method} ${path} → ${res.status} ${res.statusText}: ${text}`;
    logger.error({ message, status: res.status, path, method });
    throw new Error(`[BinaraClient] ${message}`);
  }
  return res.json() as Promise<T>;
}

// ─── Base client ──────────────────────────────────────────────────────────────

const http = {
  async get<T = unknown>(path: string, opts: GetOptions = {}): Promise<T> {
    const url = buildUrl(path, opts.query);
    const reqHeaders = { ...commonHeaders, ...opts.headers };
    try {
      const res = await fetch(url, { method: "GET", headers: reqHeaders });
      return handleResponse<T>(res, path, "GET");
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("[BinaraClient]"))) {
        logger.error({
          message: `GET ${path} network error`,
          request: { url, headers: reqHeaders },
          error: err,
        });
      }
      throw err;
    }
  },

  async post<T = unknown>(path: string, opts: PostOptions = {}): Promise<T> {
    const url = buildUrl(path, opts.query);
    const reqHeaders = { ...commonHeaders, ...opts.headers };
    const reqBody = opts.body ?? {};
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify(reqBody),
      });
      return handleResponse<T>(res, path, "POST");
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("[BinaraClient]"))) {
        logger.error({
          message: `POST ${path} network error`,
          request: { url, headers: reqHeaders, body: reqBody },
          error: err,
        });
      }
      throw err;
    }
  },
};

// ─── Binara S2S calls ─────────────────────────────────────────────────────────

export const BinaraClient = {
  /**
   * Place a new bid on the Binara platform.
   */
  async placeBid(
    data: PlaceBidRequest,
    opts: { query?: QueryParams; headers?: Headers } = {},
  ): Promise<BidResponse> {
    return http.post<BidResponse>("/api/bids/place", {
      body: data as unknown as Body,
      query: opts.query,
      headers: opts.headers,
    });
  },

  /**
   * Cancel an existing bid.
   */
  async cancelBid(
    data: CancelBidRequest,
    opts: { query?: QueryParams; headers?: Headers } = {},
  ): Promise<BidResponse> {
    return http.post<BidResponse>("/api/bids/cancel", {
      body: data as unknown as Body,
      query: opts.query,
      headers: opts.headers,
    });
  },

  /**
   * Sell (execute) an existing bid.
   */
  async sellBid(
    data: SellBidRequest,
    opts: { query?: QueryParams; headers?: Headers } = {},
  ): Promise<BidResponse> {
    return http.post<BidResponse>("/api/bids/sell", {
      body: data as unknown as Body,
      query: opts.query,
      headers: opts.headers,
    });
  },

  // Generic escape hatch for any other Binara endpoints
  get: http.get,
  post: http.post,
};
