package com.bidvelocity.bidding.repository;

import com.bidvelocity.bidding.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionId(Long auctionId);

    @Query("select max(b.bidAmount) from Bid b where b.auctionId = :auctionId")
    Optional<BigDecimal> findHighestBidAmountByAuctionId(@Param("auctionId") Long auctionId);
}
