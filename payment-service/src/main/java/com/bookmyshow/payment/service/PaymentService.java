package com.bookmyshow.payment.service;

import com.bookmyshow.payment.dto.PaymentRequest;
import com.bookmyshow.payment.dto.PaymentResponse;
import java.util.List;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest req);
    PaymentResponse getByTransactionId(String txnId);
    PaymentResponse refundPayment(String txnId);
    List<PaymentResponse> getAll();
}
