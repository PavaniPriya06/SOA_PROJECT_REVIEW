package com.bidvelocity.bidding.controller;

import com.bidvelocity.bidding.entity.Bid;
import com.bidvelocity.bidding.service.BidService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BidControllerTest {

    @Test
    void createBid_returnsBadRequestWithValidationMessage() throws Exception {
        ResponseStatusException exception = new ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Bid amount must be higher than the current highest bid.");
                BidService bidService = new BidService(null) {
                        @Override
                        public Bid createBid(Bid bid) {
                                throw exception;
                        }
                };
                MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new BidController(bidService)).build();

        mockMvc.perform(post("/bids")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"auctionId\":1,\"bidderId\":\"bidder-2\",\"bidAmount\":\"100.00\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json("{\"message\":\"Bid amount must be higher than the current highest bid.\"}"));
    }
}
