package com.bidvelocity.auction.service;

import java.math.BigDecimal;

public interface PaymentServiceClient {

    void createPayment(Long auctionId, String bidderId, BigDecimal amount);
}