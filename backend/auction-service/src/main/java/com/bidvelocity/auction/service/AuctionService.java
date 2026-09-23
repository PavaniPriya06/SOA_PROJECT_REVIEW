package com.bidvelocity.auction.service;

import com.bidvelocity.auction.entity.Auction;
import com.bidvelocity.auction.entity.AuctionStatus;
import com.bidvelocity.auction.exception.AuctionNotFoundException;
import com.bidvelocity.auction.exception.InvalidAuctionOperationException;
import com.bidvelocity.auction.exception.PaymentServiceUnavailableException;
import com.bidvelocity.auction.repository.AuctionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@Transactional
public class AuctionService {

    private static final Logger logger = LoggerFactory.getLogger(AuctionService.class);

    private final AuctionRepository auctionRepository;
    private final BiddingServiceClient biddingServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    public AuctionService(AuctionRepository auctionRepository, BiddingServiceClient biddingServiceClient,
                          PaymentServiceClient paymentServiceClient) {
        this.auctionRepository = auctionRepository;
        this.biddingServiceClient = biddingServiceClient;
        this.paymentServiceClient = paymentServiceClient;
    }

    /**
     * Create a new auction with UPCOMING status
     */
    public Auction createAuction(Auction auction) {
        // Validate that endTime is after startTime
        if (auction.getEndTime().isBefore(auction.getStartTime())) {
            throw new InvalidAuctionOperationException("End time must be after start time.");
        }

        // Set initial status to UPCOMING
        auction.setStatus(AuctionStatus.UPCOMING);
        return auctionRepository.save(auction);
    }

    /**
     * Get all auctions
     */
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    /**
     * Get auction by ID
     */
    public Auction getAuctionById(Long auctionId) {
        return auctionRepository.findByAuctionId(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction with ID " + auctionId + " not found."));
    }

    /**
     * Get all active auctions
     */
    public List<Auction> getActiveAuctions() {
        return auctionRepository.findByStatus(AuctionStatus.ACTIVE);
    }

    /**
     * Start an auction (change status from UPCOMING to ACTIVE)
     */
    public Auction startAuction(Long auctionId) {
        Auction auction = getAuctionById(auctionId);

        // Business rule: Cannot start an already ENDED auction
        if (auction.getStatus() == AuctionStatus.ENDED || auction.getStatus() == AuctionStatus.CLOSED) {
            throw new InvalidAuctionOperationException("Cannot start an auction that has already ended.");
        }

        // Business rule: Cannot start an already ACTIVE auction (idempotent, or error?)
        // For safety, we allow re-starting an ACTIVE auction (idempotent behavior)
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            auction.setStatus(AuctionStatus.ACTIVE);
            return auctionRepository.save(auction);
        }

        return auction;
    }

    /**
     * Close an auction and select the highest bidder as the winner.
     */
    public Auction closeAuction(Long auctionId) {
        Auction auction = getAuctionById(auctionId);

        if (auction.getStatus() == AuctionStatus.ENDED || auction.getStatus() == AuctionStatus.CLOSED) {
            throw new InvalidAuctionOperationException("Auction has already been closed.");
        }

        List<BidResponse> bids = biddingServiceClient.getBidsByAuctionId(auctionId);
        bids.stream()
                .max((left, right) -> left.bidAmount().compareTo(right.bidAmount()))
                .ifPresent(winningBid -> {
                    auction.setWinnerBidderId(winningBid.bidderId());
                    auction.setWinningBidAmount(winningBid.bidAmount());
                });

        auction.setStatus(AuctionStatus.CLOSED);
                Auction savedAuction = auctionRepository.save(auction);

                if (savedAuction.getWinnerBidderId() != null && savedAuction.getWinningBidAmount() != null) {
                    try {
                        paymentServiceClient.createPayment(
                                savedAuction.getAuctionId(),
                                savedAuction.getWinnerBidderId(),
                                savedAuction.getWinningBidAmount());
                    } catch (PaymentServiceUnavailableException exception) {
                        logger.warn("Auction {} closed, but winner payment could not be created: {}",
                                auctionId, exception.getMessage());
                    }
                }

                return savedAuction;
    }

    /**
     * Get auctions by seller ID
     */
    public List<Auction> getAuctionsBySellerId(String sellerId) {
        return auctionRepository.findBySellerId(sellerId);
    }
}
