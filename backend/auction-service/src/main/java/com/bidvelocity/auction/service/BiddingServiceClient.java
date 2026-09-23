package com.bidvelocity.auction.service;

import java.util.List;

public interface BiddingServiceClient {

    List<BidResponse> getBidsByAuctionId(Long auctionId);
}
