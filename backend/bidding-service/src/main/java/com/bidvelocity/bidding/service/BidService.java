package com.bidvelocity.bidding.service;

import com.bidvelocity.bidding.entity.Bid;
import com.bidvelocity.bidding.repository.BidRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BidService {

    private final BidRepository bidRepository;

    public BidService(BidRepository bidRepository) {
        this.bidRepository = bidRepository;
    }

    public Bid createBid(Bid bid) {
        Optional<BigDecimal> highestBidAmount =
            bidRepository.findHighestBidAmountByAuctionId(bid.getAuctionId());

        if (highestBidAmount.isPresent()
            && bid.getBidAmount().compareTo(highestBidAmount.get()) <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Bid amount must be higher than the current highest bid.");
        }

        if (bid.getBidTime() == null) {
            bid.setBidTime(LocalDateTime.now());
        }
        return bidRepository.save(bid);
    }

    @Transactional(readOnly = true)
    public List<Bid> getAllBids() {
        return bidRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Bid getBidById(Long bidId) {
        return bidRepository.findById(bidId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Bid with ID " + bidId + " not found."));
    }

    @Transactional(readOnly = true)
    public List<Bid> getBidsByAuctionId(Long auctionId) {
        return bidRepository.findByAuctionId(auctionId);
    }
}
