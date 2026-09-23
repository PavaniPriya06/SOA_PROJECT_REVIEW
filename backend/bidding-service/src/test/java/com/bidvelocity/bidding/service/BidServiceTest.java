package com.bidvelocity.bidding.service;

import com.bidvelocity.bidding.entity.Bid;
import com.bidvelocity.bidding.repository.BidRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.InOrder;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock
    private BidRepository bidRepository;

    @InjectMocks
    private BidService bidService;

    @Test
    void createBid_rejectsBidAtOrBelowCurrentHighestAmount() {
        Bid bid = bid(1L, "bidder-2", "100.00");
        when(bidRepository.findHighestBidAmountByAuctionId(1L))
                .thenReturn(Optional.of(new BigDecimal("100.00")));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> bidService.createBid(bid));

        assertEquals(400, exception.getStatusCode().value());
        assertEquals("Bid amount must be higher than the current highest bid.", exception.getReason());
        verify(bidRepository, never()).save(bid);
    }

    @Test
    void createBid_savesBidWhenNoPreviousBidExists() {
        Bid bid = bid(1L, "bidder-1", "100.00");
        when(bidRepository.findHighestBidAmountByAuctionId(1L)).thenReturn(Optional.empty());
        when(bidRepository.save(bid)).thenReturn(bid);

        Bid savedBid = bidService.createBid(bid);

        assertEquals(bid, savedBid);
        InOrder inOrder = inOrder(bidRepository);
        inOrder.verify(bidRepository).findHighestBidAmountByAuctionId(1L);
        inOrder.verify(bidRepository).save(bid);
    }

    private Bid bid(Long auctionId, String bidderId, String amount) {
        Bid bid = new Bid();
        bid.setAuctionId(auctionId);
        bid.setBidderId(bidderId);
        bid.setBidAmount(new BigDecimal(amount));
        return bid;
    }
}
