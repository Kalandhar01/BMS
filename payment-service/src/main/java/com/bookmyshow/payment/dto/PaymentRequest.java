package com.bookmyshow.payment.dto;

import java.math.BigDecimal;

public class PaymentRequest {
    private Long bookingId;
    private BigDecimal amount;

    public PaymentRequest() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
