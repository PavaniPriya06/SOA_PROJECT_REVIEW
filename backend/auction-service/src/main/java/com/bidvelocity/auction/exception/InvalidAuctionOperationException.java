package com.bidvelocity.auction.exception;

public class InvalidAuctionOperationException extends RuntimeException {
    public InvalidAuctionOperationException(String message) {
        super(message);
    }

    public InvalidAuctionOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
