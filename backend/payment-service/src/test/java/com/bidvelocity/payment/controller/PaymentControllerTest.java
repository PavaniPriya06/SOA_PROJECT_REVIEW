package com.bidvelocity.payment.controller;

import com.bidvelocity.payment.entity.Payment;
import com.bidvelocity.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PaymentControllerTest {

    private final StubPaymentService paymentService = new StubPaymentService();
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new PaymentController(paymentService))
            .build();

    @Test
    void createPayment_returnsCreatedPayment() throws Exception {
        paymentService.payment = payment(1L);

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"auctionId\":10,\"bidderId\":\"bidder-1\",\"amount\":\"25.00\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(1))
                .andExpect(jsonPath("$.paymentStatus").value("SUCCESS"));
    }

    @Test
    void createPayment_rejectsInvalidAmount() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"auctionId\":10,\"bidderId\":\"bidder-1\",\"amount\":\"0\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getPaymentById_returnsOk() throws Exception {
        paymentService.payment = payment(1L);

        mockMvc.perform(get("/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1));
    }

    private static class StubPaymentService extends PaymentService {
        private Payment payment;

        private StubPaymentService() {
            super(null);
        }

        @Override
        public Payment createPayment(Payment ignored) {
            return payment;
        }

        @Override
        public List<Payment> getAllPayments() {
            return List.of(payment);
        }

        @Override
        public Payment getPaymentById(Long ignored) {
            return payment;
        }

        @Override
        public List<Payment> getPaymentsByAuctionId(Long ignored) {
            return List.of(payment);
        }
    }

    private Payment payment(Long id) {
        Payment payment = new Payment();
        payment.setPaymentId(id);
        payment.setAuctionId(10L);
        payment.setBidderId("bidder-1");
        payment.setAmount(new BigDecimal("25.00"));
        payment.setPaymentStatus("SUCCESS");
        return payment;
    }
}
