package com.bidvelocity.auction.repository;

import com.bidvelocity.auction.entity.Auction;
import com.bidvelocity.auction.entity.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByStatus(AuctionStatus status);
    List<Auction> findBySellerId(String sellerId);
    Optional<Auction> findByAuctionId(Long auctionId);
}
