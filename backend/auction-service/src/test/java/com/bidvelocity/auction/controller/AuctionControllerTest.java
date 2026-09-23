package com.bidvelocity.auction.controller;

import com.bidvelocity.auction.entity.Auction;
import com.bidvelocity.auction.entity.AuctionStatus;
import com.bidvelocity.auction.exception.BiddingServiceUnavailableException;
import com.bidvelocity.auction.exception.GlobalExceptionHandler;
import com.bidvelocity.auction.service.AuctionService;
import com.bidvelocity.auction.service.PaymentServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuctionControllerTest {

    @Test
    void closeAuction_returnsClosedAuctionWithWinner() throws Exception {
        AuctionService auctionService = new StubAuctionService(auction(), null);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new AuctionController(auctionService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockMvc.perform(put("/auctions/1/close").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.winnerBidderId").value("bidder-2"))
                .andExpect(jsonPath("$.winningBidAmount").value(150.00));
    }

    @Test
    void closeAuction_returns503WhenBiddingServiceUnavailable() throws Exception {
        AuctionService auctionService = new StubAuctionService(null,
                new BiddingServiceUnavailableException(
                        "Bidding Service is unavailable.", new RuntimeException("connection refused")));
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new AuctionController(auctionService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockMvc.perform(put("/auctions/1/close"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("Service Unavailable"));
    }

        private static class StubAuctionService extends AuctionService {
                private final Auction auction;
                private final RuntimeException exception;

                private StubAuctionService(Auction auction, RuntimeException exception) {
                        super(null, null, (PaymentServiceClient) null);
                        this.auction = auction;
                        this.exception = exception;
                }

                @Override
                public Auction closeAuction(Long id) {
                        if (exception != null) {
                                throw exception;
                        }
                        return auction;
                }
        }

    private Auction auction() {
        Auction auction = new Auction("Watch", 100.0,
                LocalDateTime.now(), LocalDateTime.now().plusHours(1), "seller-1");
        auction.setAuctionId(1L);
        auction.setStatus(AuctionStatus.CLOSED);
        auction.setWinnerBidderId("bidder-2");
        auction.setWinningBidAmount(new BigDecimal("150.00"));
        return auction;
    }
}
