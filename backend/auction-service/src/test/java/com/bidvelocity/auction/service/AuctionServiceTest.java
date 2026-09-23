package com.bidvelocity.auction.service;

import com.bidvelocity.auction.entity.Auction;
import com.bidvelocity.auction.entity.AuctionStatus;
import com.bidvelocity.auction.exception.BiddingServiceUnavailableException;
import com.bidvelocity.auction.exception.InvalidAuctionOperationException;
import com.bidvelocity.auction.exception.PaymentServiceUnavailableException;
import com.bidvelocity.auction.repository.AuctionRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

class AuctionServiceTest {

    @Test
    void closeAuction_selectsHighestBidderAndAmount() {
        Auction auction = auction(1L);
        BiddingServiceClient biddingClient = auctionId -> List.of(
                new BidResponse("bidder-1", new BigDecimal("125.00")),
                new BidResponse("bidder-2", new BigDecimal("150.00")),
                new BidResponse("bidder-3", new BigDecimal("140.00")));
        AuctionRepository repository = repositoryFor(auction);
        PaymentServiceClient paymentClient = mock(PaymentServiceClient.class);
        AuctionService service = new AuctionService(repository, biddingClient, paymentClient);

        Auction closed = service.closeAuction(1L);

        assertEquals(AuctionStatus.CLOSED, closed.getStatus());
        assertEquals("bidder-2", closed.getWinnerBidderId());
        assertEquals(new BigDecimal("150.00"), closed.getWinningBidAmount());
        assertEquals(AuctionStatus.CLOSED, auction.getStatus());
        assertEquals("bidder-2", auction.getWinnerBidderId());
        assertEquals(new BigDecimal("150.00"), auction.getWinningBidAmount());
        verify(paymentClient).createPayment(1L, "bidder-2", new BigDecimal("150.00"));
    }

    @Test
    void closeAuction_withoutBidsClosesWithoutWinner() {
        Auction auction = auction(1L);
        PaymentServiceClient paymentClient = mock(PaymentServiceClient.class);
        AuctionService service = new AuctionService(repositoryFor(auction), auctionId -> List.of(), paymentClient);

        Auction closed = service.closeAuction(1L);

        assertEquals(AuctionStatus.CLOSED, closed.getStatus());
        assertNull(closed.getWinnerBidderId());
        assertNull(closed.getWinningBidAmount());
        verify(paymentClient, never()).createPayment(org.mockito.ArgumentMatchers.anyLong(),
            org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void closeAuction_propagatesBiddingServiceUnavailable() {
        Auction auction = auction(1L);
        BiddingServiceUnavailableException exception = new BiddingServiceUnavailableException(
                "Bidding Service unavailable", new RuntimeException("connection refused"));
        AuctionService service = new AuctionService(repositoryFor(auction), auctionId -> {
            throw exception;
        }, mock(PaymentServiceClient.class));

        assertThrows(BiddingServiceUnavailableException.class, () -> service.closeAuction(1L));
        assertEquals(AuctionStatus.ACTIVE, auction.getStatus());
    }

    @Test
    void closeAuction_keepsAuctionClosedWhenPaymentServiceUnavailable() {
        Auction auction = auction(1L);
        PaymentServiceClient paymentClient = (auctionId, bidderId, amount) -> {
            throw new PaymentServiceUnavailableException("Payment Service unavailable", new RuntimeException());
        };
        AuctionService service = new AuctionService(repositoryFor(auction), auctionId ->
                List.of(new BidResponse("bidder-2", new BigDecimal("150.00"))), paymentClient);

        Auction closed = service.closeAuction(1L);

        assertEquals(AuctionStatus.CLOSED, closed.getStatus());
        assertEquals("bidder-2", closed.getWinnerBidderId());
    }

    @Test
    void closeAuction_doesNotCreatePaymentWhenAlreadyClosed() {
        Auction auction = auction(1L);
        auction.setStatus(AuctionStatus.CLOSED);
        PaymentServiceClient paymentClient = mock(PaymentServiceClient.class);
        AuctionService service = new AuctionService(repositoryFor(auction), auctionId ->
                List.of(new BidResponse("bidder-2", new BigDecimal("150.00"))), paymentClient);

        assertThrows(InvalidAuctionOperationException.class, () -> service.closeAuction(1L));

        verify(paymentClient, never()).createPayment(org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any());
    }

    private Auction auction(Long id) {
        Auction auction = new Auction("Watch", 100.0,
                LocalDateTime.now(), LocalDateTime.now().plusHours(1), "seller-1");
        auction.setAuctionId(id);
        auction.setStatus(AuctionStatus.ACTIVE);
        return auction;
    }

    private AuctionRepository repositoryFor(Auction auction) {
        return (AuctionRepository) Proxy.newProxyInstance(
                AuctionRepository.class.getClassLoader(),
                new Class<?>[]{AuctionRepository.class},
                (proxy, method, args) -> {
                    if ("findByAuctionId".equals(method.getName())) {
                        return Optional.of(auction);
                    }
                    if ("save".equals(method.getName())) {
                        return args[0];
                    }
                    if ("toString".equals(method.getName())) {
                        return "AuctionRepositoryStub";
                    }
                    return defaultValue(method.getReturnType());
                });
    }

    private Object defaultValue(Class<?> returnType) {
        if (returnType == boolean.class) {
            return false;
        }
        if (returnType == int.class) {
            return 0;
        }
        if (returnType == long.class) {
            return 0L;
        }
        return null;
    }
}
