package com.bidvelocity.auction.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auctions")
@Check(name = "auctions_status_check", constraints = "status IN ('UPCOMING', 'ACTIVE', 'ENDED', 'CLOSED')")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auctionId;

    @NotBlank(message = "Item name cannot be blank")
    @Column(nullable = false)
    private String itemName;

    @NotNull(message = "Starting price cannot be null")
    @Positive(message = "Starting price must be positive")
    @Column(nullable = false)
    private Double startingPrice;

    @NotNull(message = "Start time cannot be null")
    @Column(nullable = false)
    private LocalDateTime startTime;

    @NotNull(message = "End time cannot be null")
    @Column(nullable = false)
    private LocalDateTime endTime;

    @NotBlank(message = "Seller ID cannot be blank")
    @Column(nullable = false)
    private String sellerId;

    @Column(length = 1024)
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status;

    private String winnerBidderId;

    @Column(precision = 19, scale = 4)
    private BigDecimal winningBidAmount;

    public Auction() {
    }

    public Auction(String itemName, Double startingPrice, LocalDateTime startTime, LocalDateTime endTime, String sellerId) {
        this.itemName = itemName;
        this.startingPrice = startingPrice;
        this.startTime = startTime;
        this.endTime = endTime;
        this.sellerId = sellerId;
        this.status = AuctionStatus.UPCOMING;
    }

    // Getters and Setters
    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Double getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(Double startingPrice) {
        this.startingPrice = startingPrice;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public AuctionStatus getStatus() {
        return status;
    }

    public void setStatus(AuctionStatus status) {
        this.status = status;
    }

    public String getWinnerBidderId() {
        return winnerBidderId;
    }

    public void setWinnerBidderId(String winnerBidderId) {
        this.winnerBidderId = winnerBidderId;
    }

    public BigDecimal getWinningBidAmount() {
        return winningBidAmount;
    }

    public void setWinningBidAmount(BigDecimal winningBidAmount) {
        this.winningBidAmount = winningBidAmount;
    }

    @Override
    public String toString() {
        return "Auction{" +
                "auctionId=" + auctionId +
                ", itemName='" + itemName + '\'' +
                ", startingPrice=" + startingPrice +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", sellerId='" + sellerId + '\'' +
                ", status=" + status +
                '}';
    }
}
