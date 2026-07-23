package com.bookmyshow.payment.controller;

import com.bookmyshow.payment.dto.PaymentRequest;
import com.bookmyshow.payment.dto.PaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final com.bookmyshow.payment.service.PaymentService s;

    public PaymentController(com.bookmyshow.payment.service.PaymentService s) { this.s = s; }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAll() {
        return ResponseEntity.ok(s.getAll());
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> process(@RequestBody PaymentRequest req) {
        return ResponseEntity.ok(s.processPayment(req));
    }

    @GetMapping("/{txnId}/status")
    public ResponseEntity<PaymentResponse> status(@PathVariable String txnId) {
        return ResponseEntity.ok(s.getByTransactionId(txnId));
    }

    @PostMapping("/{txnId}/refund")
    public ResponseEntity<PaymentResponse> refund(@PathVariable String txnId) {
        return ResponseEntity.ok(s.refundPayment(txnId));
    }
}
