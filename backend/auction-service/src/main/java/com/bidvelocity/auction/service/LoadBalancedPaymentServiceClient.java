package com.bidvelocity.auction.service;

import com.bidvelocity.auction.exception.PaymentServiceUnavailableException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;

@Component
public class LoadBalancedPaymentServiceClient implements PaymentServiceClient {

    private final RestClient restClient;

    public LoadBalancedPaymentServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    @Override
    public void createPayment(Long auctionId, String bidderId, BigDecimal amount) {
        try {
            restClient.post()
                    .uri("lb://PAYMENT-SERVICE/payments")
                    .body(new PaymentRequest(auctionId, bidderId, amount))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw new PaymentServiceUnavailableException(
                    "Payment Service is unavailable for auction " + auctionId + ".", exception);
        }
    }

    private record PaymentRequest(Long auctionId, String bidderId, BigDecimal amount) {
    }
}