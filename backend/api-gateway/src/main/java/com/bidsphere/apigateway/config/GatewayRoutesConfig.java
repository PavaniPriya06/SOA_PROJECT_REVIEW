package com.bidsphere.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-route", r -> r.path("/api/auth/**")
                        .filters(f -> f.rewritePath("/api/auth/(?<segment>.*)", "/${segment}"))
                        .uri("lb://AUTH-SERVICE"))
                .route("auth-direct-route", r -> r.path("/auth/**")
                        .uri("lb://AUTH-SERVICE"))
                .route("auctions-route", r -> r.path("/api/auctions/**")
                        .filters(f -> f.rewritePath("/api/auctions/(?<segment>.*)", "/${segment}"))
                        .uri("lb://AUCTION-SERVICE"))
                .route("auctions-direct-route", r -> r.path("/auctions/**")
                        .uri("lb://AUCTION-SERVICE"))
                .route("auction-images-route", r -> r.path("/uploads/**")
                        .filters(f -> f.rewritePath("/uploads/(?<segment>.*)", "/auctions/uploads/${segment}"))
                        .uri("lb://AUCTION-SERVICE"))
                .route("bids-route", r -> r.path("/api/bids/**")
                        .filters(f -> f.rewritePath("/api/bids/(?<segment>.*)", "/${segment}"))
                        .uri("lb://BIDDING-SERVICE"))
                .route("bids-direct-route", r -> r.path("/bids/**")
                        .uri("lb://BIDDING-SERVICE"))
                .route("payments-route", r -> r.path("/api/payments/**")
                        .filters(f -> f.rewritePath("/api/payments/(?<segment>.*)", "/${segment}"))
                        .uri("lb://PAYMENT-SERVICE"))
                .route("payments-direct-route", r -> r.path("/payments/**")
                        .uri("lb://PAYMENT-SERVICE"))
                .build();
    }
}
