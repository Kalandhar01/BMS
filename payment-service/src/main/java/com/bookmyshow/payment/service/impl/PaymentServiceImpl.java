package com.bookmyshow.payment.service.impl;

import com.bookmyshow.payment.client.BookingServiceClient;
import com.bookmyshow.payment.dto.PaymentRequest;
import com.bookmyshow.payment.dto.PaymentResponse;
import com.bookmyshow.payment.dto.PaymentMapper;
import com.bookmyshow.payment.entity.Payment;
import com.bookmyshow.payment.repository.PaymentRepository;
import com.bookmyshow.payment.service.PaymentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repo;
    private final BookingServiceClient bookingClient;

    public PaymentServiceImpl(PaymentRepository r, BookingServiceClient bc) {
        this.repo = r;
        this.bookingClient = bc;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest req) {
        Payment p = PaymentMapper.toEntity(req);
        p.setTransactionId("TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        p.setStatus("SUCCESS");
        p.setPaymentTime(LocalDateTime.now());
        Payment saved = repo.save(p);

        try {
            bookingClient.confirmBooking(req.getBookingId());
        } catch (Exception e) {
            System.err.println("Booking confirmation failed: " + e.getMessage());
        }

        return PaymentMapper.toResponse(saved);
    }

    @Override
    public PaymentResponse getByTransactionId(String txnId) {
        return PaymentMapper.toResponse(repo.findByTransactionId(txnId));
    }

    @Override
    public PaymentResponse refundPayment(String txnId) {
        Payment p = repo.findByTransactionId(txnId);
        if (p == null) throw new RuntimeException("Payment not found: " + txnId);
        p.setStatus("REFUNDED");
        return PaymentMapper.toResponse(repo.save(p));
    }

    @Override
    public List<PaymentResponse> getAll() {
        return repo.findAll().stream().map(PaymentMapper::toResponse).toList();
    }
}
