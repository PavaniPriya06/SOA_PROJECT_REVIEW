package com.bidvelocity.payment.service;

import com.bidvelocity.payment.entity.Payment;
import com.bidvelocity.payment.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment createPayment(Payment payment) {
        List<Payment> existingPayments = paymentRepository.findByAuctionId(payment.getAuctionId());
        if (!existingPayments.isEmpty()) {
            return existingPayments.get(0);
        }

        payment.setPaymentStatus("SUCCESS");
        if (payment.getPaymentTime() == null) {
            payment.setPaymentTime(LocalDateTime.now());
        }
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment with ID " + paymentId + " not found."));
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByAuctionId(Long auctionId) {
        return paymentRepository.findByAuctionId(auctionId);
    }
}
