package com.bookmyshow.payment.dto;

import com.bookmyshow.payment.entity.Payment;

public class PaymentMapper {

    public static PaymentResponse toResponse(Payment p) {
        if (p == null) return null;
        PaymentResponse r = new PaymentResponse();
        r.setId(p.getId());
        r.setBookingId(p.getBookingId());
        r.setTransactionId(p.getTransactionId());
        r.setAmount(p.getAmount());
        r.setStatus(p.getStatus());
        r.setPaymentTime(p.getPaymentTime());
        return r;
    }

    public static Payment toEntity(PaymentRequest req) {
        if (req == null) return null;
        Payment p = new Payment();
        p.setBookingId(req.getBookingId());
        p.setAmount(req.getAmount());
        return p;
    }
}
