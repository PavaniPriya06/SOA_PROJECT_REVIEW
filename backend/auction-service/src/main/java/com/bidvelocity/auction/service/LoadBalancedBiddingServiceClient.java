package com.bidvelocity.auction.service;

import com.bidvelocity.auction.exception.BiddingServiceUnavailableException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class LoadBalancedBiddingServiceClient implements BiddingServiceClient {

    private static final ParameterizedTypeReference<List<BidResponse>> BID_LIST_TYPE =
            new ParameterizedTypeReference<>() {
            };

    private final RestClient restClient;

    public LoadBalancedBiddingServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    @Override
    public List<BidResponse> getBidsByAuctionId(Long auctionId) {
        try {
            List<BidResponse> bids = restClient.get()
                    .uri("lb://BIDDING-SERVICE/bids/auction/{auctionId}", auctionId)
                    .retrieve()
                    .body(BID_LIST_TYPE);
            return bids == null ? List.of() : bids;
        } catch (RestClientException exception) {
            throw new BiddingServiceUnavailableException(
                    "Bidding Service is unavailable while closing auction " + auctionId + ".", exception);
        }
    }
}