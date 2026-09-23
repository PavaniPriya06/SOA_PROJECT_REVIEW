package com.bidvelocity.auction.service;

import java.math.BigDecimal;

public record BidResponse(String bidderId, BigDecimal bidAmount) {
}
