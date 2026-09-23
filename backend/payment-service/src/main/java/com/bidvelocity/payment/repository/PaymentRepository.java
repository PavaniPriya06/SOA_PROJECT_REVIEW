package com.bidvelocity.payment.repository;

import com.bidvelocity.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByAuctionId(Long auctionId);
}
