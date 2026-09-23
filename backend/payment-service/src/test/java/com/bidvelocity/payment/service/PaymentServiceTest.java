package com.bidvelocity.payment.service;

import com.bidvelocity.payment.entity.Payment;
import com.bidvelocity.payment.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void createPayment_setsSuccessStatusAndPaymentTime() {
        Payment payment = validPayment();
        payment.setPaymentStatus("PENDING");
        when(paymentRepository.findByAuctionId(10L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment created = paymentService.createPayment(payment);

        assertEquals("SUCCESS", created.getPaymentStatus());
        assertNotNull(created.getPaymentTime());
        verify(paymentRepository).save(payment);
    }

    @Test
    void createPayment_returnsExistingPaymentForAuction() {
        Payment existingPayment = validPayment();
        Payment requestedPayment = validPayment();
        requestedPayment.setAmount(new BigDecimal("30.00"));
        when(paymentRepository.findByAuctionId(10L)).thenReturn(List.of(existingPayment));

        Payment created = paymentService.createPayment(requestedPayment);

        assertEquals(existingPayment, created);
        org.mockito.Mockito.verify(paymentRepository, org.mockito.Mockito.never()).save(any(Payment.class));
    }

    @Test
    void getPaymentById_returnsPayment() {
        Payment payment = validPayment();
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        assertEquals(payment, paymentService.getPaymentById(1L));
    }

    @Test
    void getPaymentById_throwsNotFoundWhenMissing() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> paymentService.getPaymentById(1L));
    }

    private Payment validPayment() {
        Payment payment = new Payment();
        payment.setAuctionId(10L);
        payment.setBidderId("bidder-1");
        payment.setAmount(new BigDecimal("25.00"));
        return payment;
    }
}
