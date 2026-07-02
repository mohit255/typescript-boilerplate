import {
  BinaraClient,
  PlaceBidRequest,
  CancelBidRequest,
  SellBidRequest,
  BidResponse,
} from "../clients/binara.client";

export const BidService = {
  async placeBid(data: PlaceBidRequest): Promise<BidResponse> {
    return BinaraClient.placeBid(data);
  },

  async cancelBid(data: CancelBidRequest): Promise<BidResponse> {
    return BinaraClient.cancelBid(data);
  },

  async sellBid(data: SellBidRequest): Promise<BidResponse> {
    return BinaraClient.sellBid(data);
  },
};
