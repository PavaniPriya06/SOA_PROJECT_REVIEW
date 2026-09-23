package com.bidvelocity.auction.exception;

public class PaymentServiceUnavailableException extends RuntimeException {

    public PaymentServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}