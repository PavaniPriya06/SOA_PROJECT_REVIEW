package com.bidvelocity.auction.exception;

public class BiddingServiceUnavailableException extends RuntimeException {

    public BiddingServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
